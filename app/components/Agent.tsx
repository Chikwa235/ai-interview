import Image from 'next/image';
import { cn } from "@/lib/utils";
enum callStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

type AgentProps = {
  userName: string;
};

const Agent = ({ userName }: AgentProps) => {
  const isSpeaking = true; 
  const currentStatus = callStatus.FINISHED; // replace with real state
  const messages = [
    'Whats your name?',
    'My name is John, nice to meet ya'
  ];
  const lastMessage = messages[messages.length - 1];
  return (
    <>
      <div className='call-view'>
        <div className='card-interviewer'>
          <div className='avatar'>
            <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className='animate-speak'></span>}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className='card-border'>
          <div className='card-content'>
            <Image src="/user-avatar.png" alt="user avatar" width={120} height={120} className="object-cover rounded-full" />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

        {messages.length > 0 && (
            <div className="transcript-border">
                <div className="transcript">
                    <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                        {lastMessage}
                    </p>
                </div>
            </div>
        )}
      <div className='w-full flex justify-center'>
        {currentStatus !== callStatus.ACTIVE ? (
          <button className='relative btn-call'>
            <span className={cn('absolute animate-ping rounded-full opacity-75', currentStatus !== callStatus.CONNECTING && 'hidden')}>
              </span>
              <span>
                {currentStatus === callStatus.INACTIVE || currentStatus === callStatus.FINISHED ? 'call' : '. . .'}
              </span>
          </button>
        ) : (
          <button className='btn-disconnect'>End</button>
        )}
      </div>
    </>
  );
};

export default Agent;
