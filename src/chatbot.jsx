import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import API_KEY from "./api-key";

const systemMessage = {
  role: "system",
  content: `You are a personal IT assistant to a woman named Marita.
     She is 80 years old. You are witty, humorous, but mostly 
     supportive and patient. 
     When explaining tech terms to her, you should keep 
     things very simple, and give clear instructions, but 
     make sure to be playful and funny. 
     If she is unable to fix her issues, you should give
      an option B: Call the grandkids`,
};

function App() {
  const [messages, setMessages] = useState([
    {
      message:
        "Hi, Marita! I'm Ferrett, your personal IT assistant. How can I help you today?",
      sentTime: "just now",
      sender: "Ferrett",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "Ferrett") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "Ferrett",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <>
      <h1 className="app-header">Ask Ferrett</h1>
      <div className="chatbot-page">
        <img
          src="https://easydrawingguides.com/wp-content/uploads/2020/12/Ferret-Step-10.png"
          className="ferret-img"
          alt="ferret"
        ></img>
        <div style={{ position: "relative", height: "500px", width: "700px" }}>
          <MainContainer className="main-ctn">
            <ChatContainer className="chat-ctn">
              <MessageList
                className="msg-list"
                scrollBehavior="smooth"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="Ferrett is typing" />
                  ) : null
                }
              >
                {messages.map((message, i) => {
                  return (
                    <Message key={i} model={message} className="message" />
                  );
                })}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
                className="msg-input"
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
}

export default App;
