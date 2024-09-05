export interface GameResult {
    min_response_time: number | null;
    max_response_time: number | null;
    avg_response_time: number | null;
    score: number;
  }
  
  export interface UploadPayload extends GameResult {
    idToken: string;
  }