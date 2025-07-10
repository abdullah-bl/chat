# AI Chat Application

A modern, privacy-focused AI chat application built with React, TypeScript, and WebGPU-powered local language models. Chat with AI characters, use tools, and explore different conversation styles - all running locally in your browser.

## ✨ Features

### 🤖 **Local AI Processing**
- **WebGPU-powered**: Runs AI models directly in your browser using WebGPU
- **Privacy-first**: No data leaves your device - all conversations stay local
- **Offline capable**: Works without internet connection once models are loaded

### 🎭 **AI Characters**
Choose from 12 different AI personalities to chat with:
- **Wise Mentor** 🧙‍♂️ - Thoughtful guidance through stories and metaphors
- **Sarcastic Friend** 😏 - Witty companion with clever humor
- **Curious Explorer** 🔍 - Enthusiastic learner who asks thoughtful questions
- **Practical Problem Solver** ⚡ - Direct, actionable solutions
- **Creative Artist** 🎨 - Imaginative thinking and artistic perspective
- **Patient Teacher** 👨‍🏫 - Clear explanations with encouragement
- **Tech Enthusiast** 💻 - Passionate about latest technology trends
- **Philosophical Thinker** 🤔 - Deep exploration of life's big questions
- **Cheerful Motivator** 🤗 - Upbeat encouragement and positive energy
- **Analytical Scientist** 🔬 - Evidence-based, methodical approach
- **Storyteller** 📚 - Engaging narratives and vivid descriptions
- **Mindful Guide** 🧘 - Calm presence promoting mindfulness

### 🛠️ **Built-in Tools**
The AI can use various tools to enhance conversations:
- **Time & Date** - Get current time and date
- **Calculator** - Perform mathematical calculations
- **Weather** - Get weather information (simulated)
- **Web Search** - Search for information (simulated)

### 🎨 **Modern UI**
- **Dark/Light Mode** - Automatic theme switching
- **Responsive Design** - Works on desktop and mobile
- **Real-time Chat** - Smooth conversation flow
- **Markdown Support** - Rich text formatting in responses

## 🚀 Getting Started

### Prerequisites
- Modern browser with WebGPU support (Chrome 113+, Edge 113+, Firefox Nightly)
- Node.js 18+ and npm/bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### First Time Setup

1. **WebGPU Check**: The app will automatically detect if your browser supports WebGPU
2. **Model Loading**: On first visit, the AI model will download and load (this may take a few minutes)
3. **Ready to Chat**: Once loaded, you'll see the welcome screen and can start chatting

## 💬 How to Use

### Starting a Conversation
1. **Choose a Character** (optional): Select from the available AI personalities in the settings
2. **Type Your Message**: Enter your question or message in the input field
3. **Send**: Press Enter or click the send button
4. **Wait for Response**: The AI will process and respond using the selected character's style

### Using Tools
The AI can automatically use tools based on your requests:
- **"What time is it?"** → Gets current time
- **"Calculate 2 + 2"** → Performs calculation
- **"What's the weather in Tokyo?"** → Gets weather info
- **"Search for AI news"** → Searches the web

### Conversation Management
- **Clear Chat**: Use the clear button to start a new conversation
- **Character Switching**: Change AI personalities mid-conversation
- **Settings**: Adjust model parameters like temperature, max tokens, etc.

## 🔧 Configuration

### Model Settings
Access advanced settings to customize the AI behavior:
- **Temperature**: Controls response creativity (0.0 = focused, 1.0 = creative)
- **Max Tokens**: Maximum response length
- **Top P**: Nucleus sampling parameter
- **Frequency/Presence Penalty**: Reduce repetition in responses

### Custom Characters
Create your own AI personalities:
1. Go to settings
2. Add a new character with:
   - Name and description
   - System prompt (defines personality)
   - Custom icon (optional)

## 🛠️ Development

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **AI Engine**: MLC-LLM WebGPU
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **Build Tool**: Vite

### Project Structure
```
src/
├── components/
│   ├── chat/          # Chat interface components
│   └── ui/            # Reusable UI components
├── lib/
│   ├── characters.ts  # AI character definitions
│   ├── tools.ts       # Tool implementations
│   └── workers/       # WebGPU worker files
├── stores/
│   └── chat.ts        # Chat state management
└── App.tsx            # Main application component
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Browser Compatibility

### WebGPU Support Required
- **Chrome**: 113+
- **Edge**: 113+
- **Firefox**: Nightly builds
- **Safari**: Not yet supported

### Fallback
If WebGPU is not available, the app will show an error message with instructions to update your browser.

## 🔒 Privacy & Security

- **Local Processing**: All AI processing happens in your browser
- **No Data Storage**: Conversations are not stored on any server
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Transparent codebase for security review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [MLC-LLM](https://github.com/mlc-ai/mlc-llm) for WebGPU-powered local AI
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for fast development

---

**Made with ❤️ by [Abdullah Studio](https://abdullah.studio)**
