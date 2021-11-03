import { EndTurnMessage } from "./EndTurnMessage";
import { PickTargetMessage } from "./PickTargetMessage";
import { PlayCardMessage } from "./PlayCardMessage";
import { UpdateGameStateMessage } from "./UpdateGameStateMessage";

export type GameMessage = EndTurnMessage | PlayCardMessage | UpdateGameStateMessage | PickTargetMessage