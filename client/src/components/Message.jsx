import "./message.css"

const Message = ({ receivedMessage, myId }) => {
    const isCurrentUser = myId === receivedMessage.sender;
    const messageClass = isCurrentUser ? "msg-green align-right" : "msg-red align-left";

    return (
        <div className={`msg ${messageClass}`} key={receivedMessage.date}>
            {receivedMessage.message}
        </div>
    )
};

export default Message;