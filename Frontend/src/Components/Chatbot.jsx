import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Chatbot.module.css';
import Navbar from './Navbar';

// Initial greeting message
const INITIAL_CHAT_STATE = [
  {
    id: 1,
    sender: 'bot',
    type: 'card',
    title: 'Eatstik',
    role: 'Your Recipe AI Assistant',
    content:
      "Hello! I'm Eatstik ✨. I'm your one-stop solution for all questions related to recipes, nutrition, and stylish cooking. What delicious problem can I help you solve today? 🧑‍🍳",
  },
];

// Header component
const Header = () => (
  <div className={styles.header}>
    <div className={styles['header-content']}>
      <h1 className={styles['header-title']}>EATSTIK</h1>
      <p className={styles['header-subtitle']}>
        Your one-stop solution for all recipe, nutrition, and cooking queries—stylishly presented!
      </p>
    </div>
  </div>
);

// Message component
const Message = ({ message }) => {
  const { sender, type, content, title, role, list } = message;

  if (sender === 'bot' && type === 'card') {
    const isMainCard = message.id === 1;
    return (
      <div
        className={`${styles['bot-card-wrapper']} ${
          isMainCard ? styles['main-intro-card-wrapper'] : ''
        }`}
      >
        <div
          className={`${styles['bot-card']} ${
            isMainCard ? styles['main-intro-card'] : ''
          }`}
        >
          <div className={styles['card-header-content']}>
            <div
              className={`${styles.avatar} ${isMainCard ? styles.large : styles.small}`}
            >
              E
            </div>
            <div className={styles.info}>
              <p className={styles['info-name']}>{title}</p>
              {role && <p className={styles['info-role']}>{role}</p>}
            </div>
          </div>
          <div className={styles['card-content']}>
            <ReactMarkdown>{content}</ReactMarkdown>
            {list && (
              <ul>{list.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (sender === 'user' && type === 'text') {
    return (
      <div className={styles['message-user-container']}>
        <div className={styles['message-user-bubble-wrapper']}>
          <div className={`${styles['message-bubble']} ${styles['message-user-bubble']}`}>
            {content}
          </div>
        </div>
        <div className={styles['user-avatar']}>👤</div>
      </div>
    );
  }

  return null;
};

// Input field + send button component
const InputArea = ({ onSendMessage, input, setInput }) => {
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={styles['input-area-wrapper']}>
      <div className={styles['input-area']}>
        <input
          type="text"
          placeholder="Ask about recipes, nutrition, cooking tips..."
          className={styles['input-field']}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className={styles['send-button']}
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState(INITIAL_CHAT_STATE);
  const [input, setInput] = useState('');
  const [qaData, setQaData] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch('/data/chatbot.json')
      .then((res) => res.json())
      .then((data) => setQaData(data))
      .catch((err) => console.error('Failed to load QA data:', err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text) => {
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: text,
    };

    const matchedQA = qaData.find(
      (q) => q.question.toLowerCase() === text.toLowerCase()
    );

    const answerContent = matchedQA
      ? matchedQA.answer
      : `We are looking into "${text}". Meanwhile, you can ask about recipe 🍲, nutrients 🥦, calories 🔥, meal plans 📅, and more.`;

    const suggestedTopics = !matchedQA
      ? ['Recipe 🍲', 'Nutrients 🥦', 'Calories 🔥', 'Meal Plans 📅', 'Cooking Tips 👩‍🍳']
      : null;

    const aiResponse = {
      id: Date.now() + 1,
      sender: 'bot',
      type: 'card',
      title: 'Eatstik',
      content: answerContent,
      list: suggestedTopics,
    };

    setMessages((prev) => [...prev, newUserMessage, aiResponse]);
  };

  return (
    <>
      <Navbar />
      <div className={styles['app-container']}>
        <Header />
        <div className={styles['chat-box-wrapper']}>
          <div className={styles['chat-window']}>
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        <InputArea onSendMessage={handleSendMessage} input={input} setInput={setInput} />
      </div>
    </>
  );
};

export default App;
