// Thẻ gợi mở cho phụ huynh ở Buổi 5 (bài toán mở): 3 câu phụ huynh có thể hỏi con mà
// không cần biết đáp án (quan sát → dự đoán → giải thích), kèm những điều không nên làm.
import type { DomainId } from "./content";

export type ParentPromptCard = { ask: [string, string, string]; avoid: [string, string] };

const AVOID_COMMON: [string, string] = [
  "Không nói đáp án hay làm mẫu thay con—hãy để con thử sai rồi tự sửa.",
  "Không chấm “đúng/sai” ngay; hỏi “Làm sao con biết?” thay cho nhận xét.",
];

export const PARENT_PROMPTS: Record<DomainId, ParentPromptCard> = {
  number: {
    ask: ["Con thấy điều gì lặp lại trong bài “{title}”?", "Nếu làm tiếp thêm một bước, con đoán sẽ ra gì?", "Con giải thích cho bố/mẹ hiểu quy luật đó được không?"],
    avoid: ["Không nói sẵn “cứ cộng thêm …” hay chỉ ra quy luật hộ con.", AVOID_COMMON[1]],
  },
  calculation: {
    ask: ["Trong bài “{title}”, con định bắt đầu tính từ đâu?", "Có cách nào khác ra cùng kết quả không?", "Cách nào con thấy nhanh hơn, vì sao?"],
    avoid: ["Không đặt tính hộ hay đưa máy tính cho con kiểm tra ngay.", AVOID_COMMON[1]],
  },
  measurement: {
    ask: ["Trong bài “{title}”, con ước lượng trước khoảng bao nhiêu?", "Nếu đổi một số đo, kết quả sẽ thay đổi thế nào?", "Kết quả của con có hợp lý ngoài đời không?"],
    avoid: ["Không đo hay đổi đơn vị hộ con.", AVOID_COMMON[1]],
  },
  geometry: {
    ask: ["Con nhìn thấy những hình nào trong bài “{title}”?", "Nếu xoay, cắt hay ghép lại, điều gì sẽ không đổi?", "Con vẽ hoặc xếp cho bố/mẹ xem cách con nghĩ được không?"],
    avoid: ["Không vẽ sẵn lời giải hay xếp hình hộ con.", AVOID_COMMON[1]],
  },
  data: {
    ask: ["Trong bài “{title}”, con đã có những số liệu nào?", "Từ số liệu đó, điều gì chắc chắn và điều gì mới chỉ là đoán?", "Nếu hỏi thêm người khác, kết quả có thể đổi không?"],
    avoid: ["Không kết luận hộ con từ số liệu.", AVOID_COMMON[1]],
  },
  word: {
    ask: ["Con kể lại bài “{title}” bằng lời của con được không?", "Con thử một khả năng rồi kiểm tra xem nó có đúng mọi manh mối không?", "Làm sao con chắc là đã tìm đủ, không bỏ sót?"],
    avoid: ["Không lập bảng hay sơ đồ hộ con.", AVOID_COMMON[1]],
  },
};

export function parentPromptsFor(domain: DomainId, title: string): ParentPromptCard {
  const card = PARENT_PROMPTS[domain];
  return { ask: card.ask.map((line) => line.replace("{title}", title)) as ParentPromptCard["ask"], avoid: card.avoid };
}
