import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './Chat.css';

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [recipientId, setRecipientId] = useState('YOUR_GIRLFRIEND_USER_ID'); // You'll need to set this
  
  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    newSocket.emit('join', user._id);
    
    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Load existing messages
    fetch('http://localhost:5000/api/messages', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setMessages(data));
    
    return () => newSocket.close();
  }, [user._id]);
  
  const sendMessage = (text, image) => {
    if (socket) {
      socket.emit('send_message', {
        senderId: user._id,
        recipientId: recipientId,
        text,
        image
      });
    }
  };
  
  const deleteMessage = async (messageId) => {
    try {
      await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setMessages(messages.filter(m => m._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <img src={user.avatar} alt={user.name} className="user-avatar" />
          <div>
            <h2>{user.name}</h2>
            <p className="status">Online</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      <MessageList 
        messages={messages} 
        currentUser={user} 
        onDeleteMessage={deleteMessage}
      />
      
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
}

export default Chat;