import { ChatMessage } from "./message";
import type { ChatMessage as ChatMessageType } from "./types";

const demoMessages: ChatMessageType[] = [
    {
        role: "user",
        content: "Can you help me solve this math problem: 2x + 5 = 13?"
    },
    {
        role: "assistant",
        content: `<think>
Let me analyze this step by step:
1. The equation is 2x + 5 = 13
2. I need to isolate x on one side
3. First, I'll subtract 5 from both sides: 2x = 8
4. Then divide both sides by 2: x = 4
5. Let me verify: 2(4) + 5 = 8 + 5 = 13 ✓
</think>

The solution is x = 4.

Here's how I solved it:
1. **Subtract 5 from both sides**: 2x + 5 - 5 = 13 - 5 → 2x = 8
2. **Divide both sides by 2**: 2x ÷ 2 = 8 ÷ 2 → x = 4

You can verify this by plugging x = 4 back into the original equation: 2(4) + 5 = 8 + 5 = 13 ✓`
    },
    {
        role: "user",
        content: "What's the weather like in Tokyo?"
    },
    {
        role: "assistant",
        content: `<think>
The user is asking about weather in Tokyo. This requires real-time data that I don't have access to. I should use the weather tool to get current information.

Let me call the weather tool with Tokyo as the location.
</think>

<function>get_weather</function>
{"location": "Tokyo"}

Based on the weather data, here's the current weather in Tokyo:

**Current Conditions:**
- Temperature: 22°C (72°F)
- Condition: Partly cloudy
- Humidity: 65%
- Wind: 12 km/h from the northeast

**Today's Forecast:**
- High: 25°C (77°F)
- Low: 18°C (64°F)
- Precipitation: 20% chance of rain

It's a pleasant spring day in Tokyo with mild temperatures and partly cloudy skies. There's a slight chance of rain later in the day, so you might want to bring an umbrella if you're heading out.`
    }
];

export function ThinkingDemo() {
    return (
        <div className="space-y-4 p-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Thinking States Demo</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                    This demonstrates how the AI's thinking process is displayed with improved UI/UX
                </p>
            </div>

            {demoMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}
        </div>
    );
} 