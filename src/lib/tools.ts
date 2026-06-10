import type { Tool } from "@/components/chat/types";

// Simple tools registry
export const tools: Tool[] = [
    {
        name: "get_current_time",
        description: "Get the current date and time",
        parameters: {
            type: "object",
            properties: {},
            required: []
        },
        execute: async () => {
            return {
                current_time: new Date().toISOString(),
                formatted: new Date().toLocaleString()
            };
        }
    },
    {
        name: "calculate",
        description: "Perform basic mathematical calculations",
        parameters: {
            type: "object",
            properties: {
                expression: {
                    type: "string",
                    description: "The mathematical expression to evaluate (e.g., '2 + 2', '10 * 5')"
                }
            },
            required: ["expression"]
        },
        execute: async (args: { expression: string }) => {
            try {
                // Safe math parser — no eval()
                const sanitized = args.expression.replace(/[^0-9+\-*/().\s]/g, '');
                if (!sanitized.trim()) {
                    return { error: "Invalid expression", expression: args.expression };
                }
                // Simple recursive descent parser for basic math
                const result = safeMathEval(sanitized);
                if (result === null || !isFinite(result)) {
                    return { error: "Invalid mathematical expression", expression: args.expression };
                }
                return {
                    expression: args.expression,
                    result: result,
                };
            } catch (error) {
                return {
                    error: "Invalid mathematical expression",
                    expression: args.expression
                };
            }
        }
    },
    {
        name: "search_web",
        description: "Search the web for current information (simulated)",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query"
                }
            },
            required: ["query"]
        },
        execute: async (args: { query: string }) => {
            return {
                query: args.query,
                results: [
                    {
                        title: `Search results for: ${args.query}`,
                        snippet: `This is a simulated search result for "${args.query}". In a real implementation, this would connect to a search API.`,
                    }
                ],
                note: "Web search is simulated in this client-side demo."
            };
        }
    },
    {
        name: "get_weather",
        description: "Get current weather information for a location (simulated)",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city or location to get weather for"
                }
            },
            required: ["location"]
        },
        execute: async (args: { location: string }) => {
            return {
                location: args.location,
                temperature: `${Math.floor(Math.random() * 20 + 15)}°C`,
                condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][Math.floor(Math.random() * 4)],
                humidity: `${Math.floor(Math.random() * 40 + 40)}%`,
                note: "Weather data is simulated in this client-side demo."
            };
        }
    }
];

export function findTool(name: string): Tool | undefined {
    return tools.find(tool => tool.name === name);
}

/** Safe math evaluator — supports +, -, *, /, (), decimals. No eval(). */
function safeMathEval(expr: string): number | null {
    let pos = 0;
    const s = expr.replace(/\s+/g, '');

    function parseExpr(): number | null {
        let result = parseTerm();
        if (result === null) return null;
        while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
            const op = s[pos++];
            const right = parseTerm();
            if (right === null) return null;
            result = op === '+' ? result + right : result - right;
        }
        return result;
    }

    function parseTerm(): number | null {
        let result = parseFactor();
        if (result === null) return null;
        while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
            const op = s[pos++];
            const right = parseFactor();
            if (right === null) return null;
            if (op === '/' && right === 0) return null;
            result = op === '*' ? result * right : result / right;
        }
        return result;
    }

    function parseFactor(): number | null {
        if (pos < s.length && s[pos] === '(') {
            pos++;
            const result = parseExpr();
            if (pos >= s.length || s[pos] !== ')') return null;
            pos++;
            return result;
        }
        // Unary minus
        if (pos < s.length && s[pos] === '-') {
            pos++;
            const val = parseFactor();
            return val === null ? null : -val;
        }
        if (pos < s.length && s[pos] === '+') {
            pos++;
            return parseFactor();
        }
        const start = pos;
        while (pos < s.length && ((s[pos] >= '0' && s[pos] <= '9') || s[pos] === '.')) pos++;
        if (pos === start) return null;
        return parseFloat(s.substring(start, pos));
    }

    const result = parseExpr();
    return pos === s.length ? result : null;
}
