type SessionSummary = {
  firstScore: number;
  averageHintDepth: number;
  transferFirstTry: boolean;
};

type AnswerFeedbackQuestion = {
  type: "choice" | "number";
  misconception: string;
  feedbackByAnswer?: Record<string, string>;
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

/**
 * Phản hồi khi trả lời sai. Nếu đáp án con chọn ứng với một lỗi tư duy đã biết của câu hỏi
 * (ví dụ nhầm chu vi với diện tích, đếm điểm thay vì đếm đoạn) thì nói thẳng vào lỗi đó;
 * nếu không thì dùng phản hồi chung của câu.
 */
export function wrongAnswerFeedback(question: AnswerFeedbackQuestion, selectedAnswer: string) {
  const selected = selectedAnswer.trim();
  const key = question.type === "number" ? selected.replace(/[^0-9]/g, "") : selected;
  const specific = key ? question.feedbackByAnswer?.[key] : undefined;
  if (specific) return question.type === "choice" ? `Con đã chọn “${selected}”. ${specific}` : specific;
  if (question.type === "choice" && selected) {
    return `Con đã chọn “${selected}”. ${question.misconception}`;
  }
  return question.misconception;
}
