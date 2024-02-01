import io from 'socket.io-client'
import { useEffect, useState, useRef } from 'react';
import Message from './components/Message';
import "./App.css"

const socket = io.connect("http://localhost:3001")

function App() {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [room, setRoom] = useState({ roomId: "" });
  const [joined, setJoined] = useState(false);
  const chatboxRef = useRef();

  const sendMessage = () => {
    socket.emit("send_message", {
      message: message,
      date: Date.now(),
      roomId: room.roomId,
      sender: socket.id,
    });
    setMessage("");
  };

  const scrollToBottom = ()=>{
    if(chatboxRef.current){
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }

  const joinRoom = () => {
    setJoined((prev) => !prev)
    socket.emit("join_room", room);
  };

  const leaveRoom = () => {
    socket.emit("leave_room", room);
    setRoom((prev) => { return { ...prev, roomId: "" } }); // Clear the room ID
    setJoined(false); 
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setReceivedMessages(data);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    
    return () => {
      socket.off("receive_message");
      socket.off("connect_error");
    };
  }, [socket]);
  
  useEffect(()=>{
    scrollToBottom();
  }, [receivedMessages])

  return (
    <div className='App'>
      <div className='chats' ref={chatboxRef}>
        {receivedMessages
          .filter((msg) => msg.roomId === room.roomId)
          .map((receivedMessage) => (
            <Message key={receivedMessage.date} myId={socket.id} receivedMessage={receivedMessage} />
          ))}
      </div>

      {
        joined &&
        <div className='messageBox'>
          <input
            placeholder='Message...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id="msg-input"
          />
          <button onClick={()=>{message && sendMessage()}} id="msg-btn">Send Message</button>
        </div>
      }

      {
        !joined &&
        <div className='room'>
          <input
            placeholder='Room ID...'
            value={room.roomId}
            onChange={(e) => setRoom((prev) => { return { ...prev, roomId: e.target.value, user:socket.id } })}
            id="room-id"
          />
          <button onClick={joinRoom} id="room-btn">Join Room</button>
        </div>
      }
      
      {joined && <button onClick={leaveRoom} id='leave-btn'>Leave Room</button>}
    </div>
  )
}

export default App