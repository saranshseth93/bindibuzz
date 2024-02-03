import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Message, messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    // Assume chatId format is "userId--assistant" for assistant chats
    const [userId1, userId2] = chatId.split("--");
    const isAssistant = userId2 === "assistant";
    const senderId = session.user.id;

    if (senderId !== userId1 && !isAssistant) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Send and store the user's message first
    const userMessageData: Message = {
      id: nanoid(),
      senderId: senderId,
      text: text,
      timestamp: Date.now(),
    };

    // Validate and store the user's message to Redis
    await db.zadd(`chat:${chatId}:messages`, {
      score: userMessageData.timestamp,
      member: JSON.stringify(userMessageData),
    });

    // Broadcast the user's message
    await pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      userMessageData
    );

    if (isAssistant) {
      // Get the assistant's reply
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: text,
          },
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
        ],
      });

      const reply = completion.choices[0].message.content;

      // Constructing the assistant's reply message object
      const replyMessageData: Message = {
        id: nanoid(),
        senderId: "assistant",
        text: reply,
        timestamp: Date.now(),
      };

      // Store and broadcast the assistant's reply
      await db.zadd(`chat:${chatId}:messages`, {
        score: replyMessageData.timestamp,
        member: JSON.stringify(replyMessageData),
      });

      await pusherServer.trigger(
        toPusherKey(`chat:${chatId}`),
        "incoming-message",
        replyMessageData
      );
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
