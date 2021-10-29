import { EndTurnMessage } from "./EndTurnMessage";
import { PlayCardMessage } from "./PlayCardMessage";
import { UpdateGameStateMessage } from "./UpdateGameStateMessage";

export type GameMessage = EndTurnMessage | PlayCardMessage | UpdateGameStateMessage