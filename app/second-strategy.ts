// "Giải hai cách" phải là việc làm thật, không phải một ô để tick.
// Con nhập MỘT PHÉP TÍNH KHÁC cho cùng kết quả của một câu con vừa giải (ví dụ 300 + 36 cho 299 + 37).
// Ứng dụng tính phép tính đó: đúng kết quả và không phải phép tính "cho có" (cộng 0, nhân 1) thì được ghi nhận.

export type SecondWayReason = "empty" | "invalid" | "no-operator" | "trivial" | "wrong" | "ok";
export type SecondWayCheck = { ok: boolean; reason: SecondWayReason; message: string };

const SECOND_WAY_MESSAGES: Record<SecondWayReason, string> = {
  empty: "Con hãy viết một phép tính.",
  invalid: "Phép tính chưa viết xong. Con xem lại dấu và ngoặc nhé.",
  "no-operator": "Đây mới là kết quả. Con hãy viết phép tính dẫn tới kết quả đó.",
  trivial: "Cộng 0 hay nhân 1 chưa phải một cách mới. Con thử tách hoặc ghép số khác đi.",
  wrong: "Phép tính này chưa ra cùng kết quả. Con tính lại thử xem.",
  ok: "Đúng rồi! Đây là một con đường khác tới cùng kết quả.",
};

/** Đưa mọi cách viết dấu về một dạng: + - * / và ngoặc. */
function tokenize(text: string): string[] | null {
  const compact = text.replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[×xX]/g, "*").replace(/[:÷]/g, "/");
  if (!compact) return null;
  const tokens = compact.match(/\d+|[+\-*/()]/g);
  return tokens && tokens.join("") === compact ? tokens : null;
}

/** Tính biểu thức số học của trẻ (số tự nhiên, + − × :, ngoặc). Không dùng eval. */
export function evaluateExpression(text: string): number | null {
  const tokens = tokenize(text);
  if (!tokens) return null;
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  function primary(): number {
    const token = take();
    if (token === "(") {
      const value = sum();
      if (take() !== ")") throw new Error("ngoặc");
      return value;
    }
    if (!token || !/^\d+$/.test(token)) throw new Error("số");
    return Number(token);
  }
  function product(): number {
    let value = primary();
    while (peek() === "*" || peek() === "/") {
      const operator = take();
      const right = primary();
      if (operator === "/" && right === 0) throw new Error("chia 0");
      value = operator === "/" ? value / right : value * right;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (peek() === "+" || peek() === "-") {
      const operator = take();
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }
  try {
    const value = sum();
    return position === tokens.length && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** Phép tính "cho có": cộng/trừ 0, nhân/chia 1 — không thể hiện một cách nghĩ khác. */
function isTrivial(tokens: string[]) {
  return tokens.some((token, index) => {
    const before = tokens[index - 1];
    const after = tokens[index + 1];
    if (token === "0" && (before === "+" || before === "-" || after === "+")) return true;
    if (token === "1" && (before === "*" || before === "/" || after === "*")) return true;
    return false;
  });
}

export function checkSecondWay(expression: string, answer: number): SecondWayCheck {
  const result = (reason: SecondWayReason): SecondWayCheck => ({ ok: reason === "ok", reason, message: SECOND_WAY_MESSAGES[reason] });
  if (!expression.trim()) return result("empty");
  const tokens = tokenize(expression);
  const value = evaluateExpression(expression);
  if (!tokens || value === null) return result("invalid");
  if (!tokens.some((token) => /^[+\-*/]$/.test(token))) return result("no-operator");
  if (Math.abs(value - answer) > 1e-9) return result("wrong");
  if (isTrivial(tokens)) return result("trivial");
  return result("ok");
}

/** Kết quả từ 10 trở lên mới là một phép tính đáng tách ghép (không hỏi "cách khác" cho câu đếm 4 trục đối xứng). */
export const SECOND_WAY_MIN_ANSWER = 10;
type QuestionLike ={ type: "choice" | "number"; answer: string; prompt: string };

/**
 * Câu dùng cho phần "giải hai cách": câu điền số có kết quả lớn nhất (dễ tách ghép nhất), tối thiểu là 10.
 * Buổi học chỉ toàn câu trắc nghiệm thì trả về null (khi đó con kể cách thứ hai bằng lời).
 */
export function secondWayQuestion<T extends QuestionLike>(questions: T[]): T | null {
  const numeric = questions.filter((question) => question.type === "number" && /^\d+$/.test(question.answer) && Number(question.answer) >= SECOND_WAY_MIN_ANSWER);
  return numeric.reduce<T | null>((best, question) => (!best || Number(question.answer) > Number(best.answer) ? question : best), null);
}

export type ExpressionKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "+" | "−" | "×" | ":" | "(" | ")" | "backspace" | "clear";
export const EXPRESSION_MAX_LENGTH = 24;

export function applyExpressionKey(value: string, key: ExpressionKey) {
  if (key === "clear") return "";
  if (key === "backspace") return value.trimEnd().slice(0, -1).trimEnd();
  if (value.replace(/\s/g, "").length >= EXPRESSION_MAX_LENGTH) return value;
  const operator = key === "+" || key === "−" || key === "×" || key === ":";
  return operator ? `${value.trimEnd()} ${key} ` : `${value}${key}`;
}
