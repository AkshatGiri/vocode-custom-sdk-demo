import { create } from "zustand";
import { MediaRecorder, register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder"; // Support for wav encoding across browsers isn't great. This is a polyfill that adds support for wav encoding.
import Queue from "../utils/Queue";

// We need to register the wav encoder before we can use it.
const registerWav = async () => {
  await register(await connect()); // TODO: How can this fail? What happens if this fails? Test if it works on most browsers.
};
registerWav().catch(console.error);

const SOCKET_URL = "wss://interview-pro-backend.onrender.com/conversation"; // TODO: This will be dynamic and will be coming from the html tag of the web component.

export const ConversationStates = {
  NOT_STARTED: "NOT_STARTED",
  PERMISSIONS_REQUESTED: "PERMISSIONS_REQUESTED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  WEBSOCKET_CONNECTING: "WEBSOCKET_CONNECTING",
  IN_PROGRESS: "IN_PROGRESS",
  ENDED: "ENDED",
  ERROR: "ERROR", // THOUGHT: Should we be more specific with the type of error states here, or should that be handled seperately with another error state object. POOSIBLE ERROR STATES - Audio not supported, websocket failed, connection lost, mic changed and we cannot continue getting the audio stream, unexpected errors.
};

export const AgentStates = {
  SPEAKING: "SPEAKING",
  LISTENING: "LISTENING",
};

export const WebsocketMessageTypes = {
  websocket_audio: "websocket_audio",
  websocket_audio_config_start: "websocket_audio_config_start",
  websocket_ready: "websocket_ready",
};

export const useConversationStore = create((set, get) => ({
  conversationState: ConversationStates.NOT_STARTED,
  conversationStartTime: null,
  agentState: AgentStates.LISTENING,
  internalConversationObjs: {
    // We are storing these values so we can easily close, destroy & reset them cleanly when call ends.
    audioStream: null,
    recorder: null,
    socket: null,
  },
  agentAudioQueue: new Queue({
    // NOTE: The agent audio is controlled by the queue. When new audio is added to the queue it will automatically play. When the queue is empty, the agent will be in listening state.
    onChange: (length) => {
      // audio queue is empty
      if (length === 0) {
        set({ agentState: AgentStates.LISTENING });
      }

      // agent was listenting but now has some audio data to speak
      if (get().agentState === AgentStates.LISTENING && length === 1) {
        function playQueue() {
          // will recursively play the queue until it is empty.
          if (get().agentAudioQueue.isEmpty()) {
            return;
          }
          playAudio(get().agentAudioQueue.peek(), () => {
            get().agentAudioQueue.dequeue();
            playQueue();
          });
        }
        playQueue();
        set({ agentState: AgentStates.SPEAKING });
      }
    },
  }),
  startConversation: async () => {
    try {
      ///////////////////////////////
      // SETUP THE AUDIO INPUT STREAM
      ///////////////////////////////

      set({ conversationState: ConversationStates.PERMISSIONS_REQUESTED });

      const internalConversationObjs = get().internalConversationObjs;

      // Get permission for the microphone & start the stream
      // NOTE: navigator.mediaDevices are only available on secure origins (HTTPS or localhost). If navigator.mediaDevices is undefined. While debugging in safari ( or ios safari ) you can enable webrtc from insecure sites using the developer menu. After connecting phone -> safari -> develop -> open web inspector -> click the phone icon -> enable webrtc from insecure sites.
      const stream = await navigator.mediaDevices.getUserMedia({
        // TODO: Add browser feature detection for navigator.mediaDevices.getUserMedia - https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      }); // TODO: Handle permission denied error case.
      internalConversationObjs.audioStream = stream;

      const recorder = new MediaRecorder(stream, {
        // NOTE: Media recorder is only available in secure contexts ( https ). So to test on mobile, we need a ngrok tunnel that makes our website https for testing.
        mimeType: "audio/wav",
      });
      internalConversationObjs.recorder = recorder;

      const micSettings = stream.getAudioTracks()[0].getSettings();
      const { sampleRate } = micSettings;
      const CHUNK_SIZE = 2048;
      console.log("sample rate", sampleRate);
      const timeSlice = Math.round((1000 * CHUNK_SIZE) / sampleRate); // TODO: Vocode react sdk defaults to 10ms if all these settings are not available. Do we need to do that? What browsers don't support this setting?

      /////////////////////////
      // SETUP THE WEBSOCKET
      ////////////////////////

      // Create a new websocket connection

      set({ conversationState: ConversationStates.WEBSOCKET_CONNECTING });

      // const SOCKET_URL = "ws://127.0.0.1:8000/conversation";
      const socket = new WebSocket(SOCKET_URL);
      // const socket = new WebSocket(SOCKET_URL);
      internalConversationObjs.socket = socket;

      // Setup listeners for the websocket events

      // Start listening to audio once websocket connection is open.
      function _websocketOpenHandler(event) {
        set({
          conversationState: ConversationStates.IN_PROGRESS,
          conversationStartTime: new Date(),
        });

        recorder.start(timeSlice);

        socket.send(
          JSON.stringify({
            type: WebsocketMessageTypes.websocket_audio_config_start,
            conversation_id: "uwRoj4bVJCUQX8JwFr8s", // TODO: Remove this. Only for tesitng with my custom vocode backend.
            input_audio_config: {
              sampling_rate: sampleRate,
              audio_encoding: "linear16",
              chunk_size: CHUNK_SIZE,
              // downsampling: OPTIONAL PARAM - TODO: Vocode reactsdk downsamples to 2 if on safari. But I'm not sure why they do it. We need to answer this to use this properly. We shouldn't downsample only based on the browser. There is most likely a much more specifc check we can do to figure out how much to downsample. TODO: Look into this.
              // downsampling: 2,
            },
            output_audio_config: {
              sampling_rate: new AudioContext().sampleRate,
              audio_encoding: "linear16",
            },
            subscribe_transcript: false,
          })
        );
        async function _recorderDataHandler(event) {
          const base64 = await blobToBase64(event.data);
          socket.send(
            JSON.stringify({
              type: WebsocketMessageTypes.websocket_audio,
              data: base64,
            })
          );
        }

        recorder.addEventListener("dataavailable", _recorderDataHandler);
        recorder.onstop = () => {
          recorder.removeEventListener("dataavailable", _recorderDataHandler);
        };
      }
      socket.addEventListener("open", _websocketOpenHandler);

      // Handle incoming messages from the websocket
      async function _websocketMessageHandler(event) {
        const message = JSON.parse(event.data); // TODO: Json parse can fail and throw an error. Handle error state gracefully & log it.

        if (message.type === WebsocketMessageTypes.websocket_audio) {
          get().agentAudioQueue.enqueue(message.data);
        }
      }
      socket.addEventListener("message", _websocketMessageHandler);

      socket.onclose = () => {
        socket.removeEventListener("message", _websocketMessageHandler);
        socket.removeEventListener("open", _websocketOpenHandler);
      };
    } catch (err) {
      // TODO: Handle websocket connection closed / errors / audio paused etc and then cleanup the state.
      console.error(err);

      set({ conversationState: ConversationStates.ERROR });
    }
  },
  endConversation: () => {
    // Empty out audio queue
    get().agentAudioQueue.clear();

    const { recorder, audioStream, socket, recorderDataListener } =
      get().internalConversationObjs;

    // Stop the audio recorder
    recorder?.stop();

    // Stop the audio stream
    audioStream?.getTracks().forEach((track) => {
      track.stop();
    });

    // Close the websocket connection
    socket?.close();

    set({
      conversationState: ConversationStates.ENDED,
      agentState: AgentStates.LISTENING, // Setting it back to default. Our audio queue trigger depends on this state. THOUGHT: This is a logical error however, maybe it's worth adding an idle state.
    });
  },
  reset: () => {
    // TODO:
    // First end the conversation
    // Reset all state.
  },
}));

////////////////////////
// UTLITY FUNCTIONS
////////////////////////

// TODO: Test if this exact code works in android browsers
// This function can play audio that is encoded as base64 format ( THOUGHT: does the audio format matter? mp4, mov, wav? Are multiple formats supported? Are the same formats supported by multiple browsers? )
async function playAudio(base64AudioData, onAudioEnd) {
  const audioContext = new AudioContext(); // THOUGHT: Should we keep audio context in state and use the same one over time?
  // NOTE: TEST - Is every step here actually necessary?
  const base64ToBuffer = Buffer.from(base64AudioData, "base64");
  const response = await fetch(URL.createObjectURL(new Blob([base64ToBuffer])));
  const audioArrayBuffer = await response.arrayBuffer();

  audioContext.decodeAudioData(audioArrayBuffer, (buffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    source.onended = onAudioEnd;
  });
}

// returns a base64 string or null
export const blobToBase64 = (blob) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result?.toString().split(",")[1] || null);
    reader.readAsDataURL(blob);
  });
};

document.useConversationStore = useConversationStore; // this makes our store accessible to the rest of the website. Only needed since we're bundling this react app as a web component.
