import React, { useContext } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    socket.on('user-message', (message) => {
      const newMessage = {
        user: 'me',
        message: message,
      }
      setMessages((messages) => [...messages, newMessage]);
      setLatestMessage("bot", message);
      playReceive();
    });
    socket.on('bot-typing', (message) => {
      setMessages((messages) => {
        if (messages[messages.length - 1]?.type === 'typing') {
          return messages;
        }
        return [...messages, { type: 'typing' }]
      });
    });
    socket.on('bot-message', (message) => {
      debugger;
      const newMessage = {
        user: 'bot',
        message: message,
      }
      setMessages((messages) => {
        let newMessages = messages;
        if (messages[messages.length - 1]?.type === 'typing') {
          // remove typing message
          newMessages = messages.slice(0, -1);
        }
        return [...newMessages, newMessage];
      });
      setLatestMessage("bot", message);
      playReceive();
    });
  }, []);

  React.useEffect(() => {
    const messageList = document.getElementById('message-list');
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  const onChangeMessage = (event) => {
    setMessage(event.target.value);
  }

  const sendMessage = (event) => {
    socket.emit('user-message', message, (result) => {
      /*  server not firing callback
      const newMessage = {
        user: "me",
        message: message,
      }
      setMessages((messages) => [...messages, newMessage]);
      setLatestMessage("bot", message);
      setMessage('');
      */
    });
    const newMessage = {
      user: "me",
      message: message,
    }
    setMessages((messages) => [...messages, newMessage]);
    setLatestMessage("bot", message);
    setMessage('');
    playSend();
  };

  const renderMessages = () => {
    return messages.map((message, index) => {
      if (message.type === 'typing') {
        return <TypingMessage key={index} />;
      }
      return <Message key={index} message={message} botTyping={message.botTyping} />;
    });
  };

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {renderMessages()}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
