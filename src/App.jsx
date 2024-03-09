import CallTimer from "./components/CallTimer";
import { useDebounce } from "./hooks/useDebounce";
import {
  AgentStates,
  ConversationStates,
  useConversationStore,
} from "./stores/conversationStore";

export default function App() {
  return (
    <div>
      <div
        className="max-w-xl rounded-xl shadow"
        style={{
          border: "1px solid rgba(0, 0, 0, 0.10)",
          padding: "1.5rem",
          display: "grid",
          gap: "0.5rem",
          placeItems: "center",
          margin: "auto",
        }}
      >
        <span className="text-2xl font-bold text-center">
          Pre-Screening for Data Entry Role
        </span>
        <Call />
        {/* <div
          className="text-sm"
          style={{
            placeSelf: "start",
          }}
        >
          Powered by <span className="font-bold">Synthflow AI</span>
        </div> */}
      </div>
    </div>
  );
}

function Call() {
  const conversationState = useConversationStore(
    (state) => state.conversationState
  );
  if (conversationState === ConversationStates.NOT_STARTED) {
    return <StartCall />;
  }
  if (
    conversationState === ConversationStates.PERMISSIONS_REQUESTED ||
    conversationState === ConversationStates.WEBSOCKET_CONNECTING
  ) {
    return (
      <>
        <span className="text-xl">Your call will start soon...</span>
        <button
          className="button"
          data-btn-intent="primary"
          data-btn-size="large"
          data-btn-width-full="false"
          aria-disabled="true"
          onClick={() => {}}
        >
          Connecting...
        </button>
      </>
    );
  }

  if (conversationState === ConversationStates.IN_PROGRESS) {
    return <CallInProgress />;
  }

  if (conversationState === ConversationStates.ENDED) {
    return <div className="text-xl">Call ended</div>;
  }

  if (conversationState === ConversationStates.ERROR) {
    return <div className="text-xl">Sorry, there was an error.</div>;
  }
}

function CallInProgress() {
  const agentState = useConversationStore((state) => state.agentState); // THOUGHT: This state changes too often, sometimes simply because the AI has a gap when its speaking. We can debounce these states and find a good value to reduce the flickers.
  const endConversation = useConversationStore(
    (state) => state.endConversation
  );

  const callStartTime = useConversationStore(
    (state) => state.conversationStartTime
  );

  const debouncedAgentState = useDebounce(agentState, 300);
  return (
    <>
      {debouncedAgentState === AgentStates.SPEAKING && (
        <span className="text-xl">AI is speaking now</span>
      )}
      {debouncedAgentState === AgentStates.LISTENING && (
        <span className="text-xl">AI is listening</span>
      )}
      <CallTimer startTime={callStartTime} />
      <button
        className="button"
        data-btn-intent="secondary"
        data-btn-size="large"
        data-btn-width-full="false"
        onClick={() => {
          endConversation();
        }}
      >
        End Call
      </button>
    </>
  );
}

function StartCall() {
  const startConversation = useConversationStore(
    (state) => state.startConversation
  );
  const startTime = new Date("October 17, 2023 23:40:00");
  return (
    <>
      <span className="text-xl">Ready to begin the call?</span>
      <button
        className="button"
        data-btn-intent="primary"
        data-btn-size="large"
        data-btn-width-full="false"
        onClick={() => {
          startConversation();
        }}
      >
        Start Call
      </button>
    </>
  );
}
