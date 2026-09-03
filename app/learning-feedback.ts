type SessionSummary = {
  firstScore: number;
  averageHintDepth: number;
  transferFirstTry: boolean;
};

type AnswerFeedbackQuestion = {
  type: "choice" | "number";
  misconception: string;
};

export function correctOnFirstAttempt(firstScore: number, questionCount: number) {
  if (questionCount <= 0) return 0;
  return Math.max(0, Math.min(questionCount, Math.round((firstScore / 100) * questionCount)));
}

export function missionStrength(session?: SessionSummary) {
  if (!session) return "Dám hoàn thành và nhìn lại cách làm";
  if (session.firstScore >= 100) return "Tự giải đúng ngay từ lần đầu";
  if (session.transferFirstTry) return "Mang ý tưởng sang một bài toán mới";
  if (session.averageHintDepth <= 0.8) return "Biết dùng vừa đủ gợi ý để tự sửa";
  return "Kiên trì thử lại và hoàn thành nhiệm vụ";
}

export function wrongAnswerFeedback(question: AnswerFeedbackQuestion, selectedAnswer: string) {
  const selected = selectedAnswer.trim();
  if (question.type === "choice" && selected) {
    return `Con đã chọn “${selected}”. ${question.misconception}`;
  }
  return question.misconception;
}
