import { GameMessage } from "./game_messages/GameMessage";
import { SendChatMessageMessage } from "./SendChatMessageMessage";
import { UpdateChatManagerMessage } from "./UpdateChatManagerMessage";

export type ServerMessage = GameMessage | UpdateChatManagerMessage | SendChatMessageMessage