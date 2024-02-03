import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { message, chatId } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: message,
          },
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
        ],
      });

      const reply = completion.choices[0].message.content;
      const timestamp = Date.now();

      // Constructing the message object
      const replyMessage = {
        id: nanoid(),
        senderId: "assistant",
        text: reply,
        timestamp,
      };

      // This triggers an event with the message sent by the user (which you don't want)
      await pusherServer.trigger(
        toPusherKey(`chat:${chatId}`),
        "incoming-message",
        message
      );

      // This should trigger an event with the assistant's reply (which you do want)
      await pusherServer.trigger(
        `private-chat-${chatId}`,
        "incoming-message",
        replyMessage
      );

      // await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      //   ...message,
      //   senderImg: sender.image,
      //   senderName: sender.name
      // })

      // pusherServer.trigger(`private-chat-${chatId}`, 'incoming-message', replyMessage);
      // Storing the assistant's response in Redis
      await db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: JSON.stringify(replyMessage),
      });

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error communicating with the ChatGPT API:", error);
      res
        .status(500)
        .json({ message: "Error communicating with the ChatGPT API", error });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
