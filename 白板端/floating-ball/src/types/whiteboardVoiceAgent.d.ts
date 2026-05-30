export type WhiteboardVoiceActionType =
  | 'draw_shape'
  | 'generate_question'
  | 'next_page'
  | 'prev_page'
  | 'clear_board'
  | 'start_timer'
  | 'show_answer'
  | 'push_exercise'
  | 'random_student'
  | 'open_toc'

export interface VoiceRecognizeRequest {
  classroomSessionId: string
  audioFileId: string
  locale: 'zh-CN'
}

export interface VoiceRecognizeResponse {
  transcript: string
  confidence: number
}

export interface VoiceCommand {
  type: WhiteboardVoiceActionType
  payload: Record<string, unknown>
  sourceText: string
}

export interface VoiceCommandExecutionResult {
  command: VoiceCommand
  executed: boolean
  feedback: string
  affectedPage?: number
}
