// dino-mission-stories.ts
// Lớp bối cảnh khủng long cho 36 nhiệm vụ: mỗi nhiệm vụ gắn với loài và vùng đất của nó.
// CHỈ thay câu chữ — mọi con số, đáp án và lựa chọn giữ nguyên (tests/dino-stories.test.mjs kiểm tra).
// - hook: câu chuyện mở đầu hiện ở đầu nhiệm vụ
// - wonder: câu Dự đoán (bước 1)
// - practice: câu đầu tiên của practice[], cũng là câu Thử nghiệm (bước 2)
// - labPrompt: chỉ dùng khi bước 2 là bài tương tác riêng (geometry-1)
// - explanation: lời giải mới khi đổi đồ vật trong câu practice

export type DinoMissionStory = {
  hook: string;
  wonder: string;
  practice: string;
  labPrompt?: string;
  explanation?: string;
};

export type AuthenticTask = {
  title: string;
  steps: [string, string, string];
  share: string;
};

export const DINO_MISSION_STORIES: Record<string, DinoMissionStory> = {
  // ===== Quy luật — Rừng Vằn Lá =====
  "number-1": {
    hook: "Ở Rừng Vằn Lá, Rex Tí Hon để lại dấu chân trên nền đất mềm. Nhìn đủ kỹ, con sẽ đoán được bước tiếp theo của bé đặt ở đâu.",
    wonder: "Rex Tí Hon đặt dấu chân ở các cọc số 2, 5, 10, 17, … Dãy dấu chân đang dài ra theo cách nào? Hãy dự đoán trước khi xem mẫu.",
    practice: "Một đàn khủng long bay qua Rừng Vằn Lá, hạ cánh ở các cọc số 6, 10, 14, 18, … Lần hạ cánh tiếp theo ở cọc số mấy?",
  },
  "number-2": {
    hook: "Trice Ba Sừng giấu tổ sau một cánh cổng khoá bằng ba thẻ số. Chỉ đổi chỗ các thẻ một chút là ra cả một kho mật mã.",
    wonder: "Cổng tổ của Trice dùng ba thẻ 2, 5, 8, mỗi thẻ đúng một lần. Có bao nhiêu mật mã lớn hơn 500? Làm sao chắc rằng con không bỏ sót?",
    practice: "Cổng thứ hai dùng ba thẻ 1, 4, 7, mỗi thẻ đúng một lần. Lập được bao nhiêu mật mã có ba chữ số?",
  },
  "number-3": {
    hook: "Stego Lưng Gai có gai xếp thành từng cặp trên lưng. Có những điều ta biết chắc về kết quả, như chẵn hay lẻ, dù chưa đếm hết.",
    wonder: "Hai đàn Stego, mỗi đàn có số con lẻ. Gộp hai đàn lại thì tổng số con luôn chẵn, đôi khi chẵn, hay không thể biết? Con hãy thử vài ví dụ trước.",
    practice: "Rừng Vằn Lá có 428 lá dương xỉ và 317 lá cọ. Không tính đầy đủ: tổng số lá là số chẵn hay lẻ?",
  },
  "number-4": {
    hook: "Para Mào Ống thổi mào gọi đàn theo nhịp. Nhưng tiếng gió trong rừng đôi khi làm nhịp bị nhiễu—con cần bằng chứng để biết đâu là quy luật thật.",
    wonder: "Nếu hai quy luật tiếng gọi đều khớp ba tiếng đầu, ta cần thêm bằng chứng nào để chọn?",
    practice: "Para thổi mào vào các giây 3, 7, 11, 15, … Tiếng gọi tiếp theo vang lên ở giây thứ mấy?",
  },
  "number-5": {
    hook: "Anky Giáp Sắt đi tuần quanh Rừng Vằn Lá theo lịch lặp lại mỗi tuần. Hiểu chu kỳ, con đoán được ngày mà không cần đếm từng ngày.",
    wonder: "Hôm nay là thứ Ba. Anky sẽ đi tuần về sau 16 ngày nữa. Hôm ấy là thứ mấy?",
    practice: "Hôm nay là thứ Hai. Trứng của Anky sẽ nở sau 10 ngày nữa. Hôm ấy là thứ mấy?",
  },
  "number-6": {
    hook: "Compi Nhỏ Xíu thích tự nghĩ ra trò nhảy đá. Một quy luật hay phải rõ đến mức bạn khác đọc xong là nhảy tiếp được.",
    wonder: "Compi nhảy lên các tảng đá số 2, 5, 8. Có thể tạo hai kiểu nhảy khác nhau cùng bắt đầu 2, 5, 8 không?",
    practice: "Compi bắt đầu ở tảng đá số 4, mỗi lần nhảy tới tảng có số gấp đôi rồi cộng 1. Tảng đá thứ ba Compi đứng là số mấy?",
  },

  // ===== Chiến lược — Cao Nguyên Săn Mồi =====
  "calculation-1": {
    hook: "Velo Tinh Ranh không phải con chạy nhiều nhất cao nguyên—nó là con tìm ra lối tắt ngắn nhất. Tính nhẩm cũng vậy.",
    wonder: "Velo đã chạy 199 m, rồi chạy thêm 48 m. Có nhất thiết phải đặt tính để biết Velo chạy bao nhiêu mét không? Con có thể biến 199 thành số nào dễ tính hơn?",
    practice: "Velo đi 298 bước tới vách đá rồi thêm 46 bước tới hang. Tính nhanh: tất cả bao nhiêu bước?",
  },
  "calculation-2": {
    hook: "Đàn Styra Khiên Sống đứng thành hàng để che chở con non. Cùng một đáp án có đường dài, đường ngắn và đường giúp ta nhìn ra điều mới.",
    wonder: "Có 36 hàng Styra, mỗi hàng 7 con. Tính 36 × 7 bằng 30 × 7 + 6 × 7. Con còn thấy cách tách nào khác?",
    practice: "Có 42 hàng Styra, mỗi hàng 6 con. Tính bằng cách tách: 42 × 6 = ?",
  },
  "calculation-3": {
    hook: "Allo Vua Săn khắc những phép tính bí mật lên vách đá. Biết kết quả cuối, con lần ngược để tìm số ban đầu—giống tháo một chiếc máy.",
    wonder: "Trên vách đá, Allo khắc phép tính: □ × 6 + 5 = 47. Con nên tháo +5 hay ×6 trước?",
    practice: "Vách đá thứ hai của Allo khắc: □ × 4 + 3 = 35. Tìm số trong ô.",
  },
  "calculation-4": {
    hook: "Eu Giáp Chuỳ vung đuôi chuỳ phải giữ thăng bằng hai bên. Phép cộng cũng giữ được cân bằng khi chuyển bớt từ bên này sang bên kia.",
    wonder: "Eu mang 398 hạt ở túi trái và 57 hạt ở túi phải. Vì sao 398 + 57 bằng 400 + 55?",
    practice: "Eu nhặt 398 quả thông rồi nhặt thêm 46 quả. Tính nhanh 398 + 46.",
  },
  "calculation-5": {
    hook: "Utah Móng Vuốt luôn ước lượng khoảng cách trước khi lao tới. Ước lượng không thay đáp án chính xác, nhưng giúp bắt những kết quả vô lý.",
    wonder: "Utah chạy 487 m rồi chạy thêm 316 m. Quãng đường gần 700, 800 hay 900 m nhất?",
    practice: "Đàn Utah đi 487 bước buổi sáng và 316 bước buổi chiều. Tổng số bước gần số nào nhất?",
  },
  "calculation-6": {
    hook: "Diablo Sừng Quỷ thích đố bạn bè bằng những con số đích. Mỗi bạn tìm một đường khác nhau để về đúng đích.",
    wonder: "Diablo đặt đích là 100 quả mọng. Con tạo được bao nhiêu biểu thức khác nhau có kết quả 100?",
    practice: "Diablo cần đúng 100 quả mọng. Biểu thức nào cho đúng 100 quả?",
  },

  // ===== Mô hình — Đầm Lầy Kiến Tạo =====
  "measurement-1": {
    hook: "Bra Cổ Dài cao ngang một toà nhà bốn tầng. Ở Đầm Lầy Kiến Tạo, một đáp án đúng phép tính nhưng vô lý ngoài đời vẫn cần xem lại.",
    wonder: "Cửa trạm quan sát của đội thám hiểm ở Đầm Lầy cao 20 cm, 2 m hay 20 m? Không cần thước, con vẫn có thể loại hai đáp án.",
    practice: "Đơn vị hợp lý để đo chiều dài cái cổ của Bra Cổ Dài là gì?",
    explanation: "Cổ của Bra dài vài mét nên mét là đơn vị phù hợp.",
  },
  "measurement-2": {
    hook: "Diplo Đuôi Roi muốn rào một bãi cỏ bằng dây leo. Thiết kế hay phải vừa số đo, vừa đủ vật liệu có sẵn.",
    wonder: "Có 30 cm dây leo làm khung chữ nhật dài 9 cm cho mô hình tổ của Diplo. Khung rộng nhất được bao nhiêu?",
    practice: "Có 40 cm dây leo làm khung vuông cho mô hình hồ nước của Diplo. Mỗi cạnh dài bao nhiêu?",
  },
  "measurement-3": {
    hook: "Spino Buồm Lưng muốn rào một ao cá. Cùng một lượng hàng rào, cách xếp khác nhau tạo ra những ao rộng rất khác nhau.",
    wonder: "Có 20 m hàng rào quanh ao của Spino. Ao 1×9, 2×8, 3×7, 4×6 hay 5×5 rộng nhất?",
    practice: "Có 24 m hàng rào làm ao cá hình chữ nhật cho Spino. Ao nào có diện tích lớn nhất?",
  },
  "measurement-4": {
    hook: "Pachy Đầu Vòm vẽ bản đồ lối đi trong Đầm Lầy lên một chiếc lá lớn. Mỗi ô trên bản đồ thay cho một đoạn đường thật.",
    wonder: "Trên bản đồ của Pachy, mỗi ô là 5 m; đi 7 ô thì ngoài đời bao xa?",
    practice: "Mỗi ô trên bản đồ của Pachy biểu diễn 5 m. Đường tới hồ bùn dài 7 ô. Đường thật dài bao nhiêu mét?",
  },
  "measurement-5": {
    hook: "Ptera Cánh Da có lịch bay kín mít: bắt cá, về tổ, dạy con bay. Lịch hay là lịch không bị chồng chéo.",
    wonder: "Ptera muốn bắt cá và dạy con bay trong 90 phút, nhưng mất 10 phút bay qua lại. Hai việc có thật sự vừa không?",
    practice: "Ptera bắt đầu dạy con bay lúc 8:20 và dạy 35 phút. Buổi dạy kết thúc lúc nào?",
  },
  "measurement-6": {
    hook: "Igua Ngón Cái trông quầy đồ thám hiểm ở rìa Đầm Lầy. Mua sắm khéo là mua đủ mà vẫn còn tiền dự phòng.",
    wonder: "Đội thám hiểm có 100 nghìn đồng để mua đồ ở quầy của Igua. Làm sao mua đủ mà vẫn còn khoản dự phòng?",
    practice: "Có 80 000 đồng, mua 3 chiếc đèn pin ở quầy của Igua, mỗi chiếc giá 18 000 đồng. Còn lại bao nhiêu?",
  },

  // ===== Hình học — Sa Mạc Pha Lê =====
  "geometry-1": {
    hook: "Kentro Gai Tam Giác xây tổ bằng 12 phiến đá pha lê vuông. Có nhiều cách xếp cùng 12 phiến—nhưng hàng rào gai quanh mỗi tổ có dài bằng nhau không?",
    wonder: "Kentro thử ba kiểu tổ 1×12, 2×6 và 3×4, đều dùng 12 phiến đá. Hàng rào quanh ba tổ có dài bằng nhau không?",
    practice: "Tổ 2×5 phiến đá của Kentro có diện tích bao nhiêu ô vuông?",
    labPrompt: "Chọn từng cách xếp 12 phiến đá cho tổ của Kentro. Quan sát diện tích và chu vi thay đổi ra sao.",
  },
  "geometry-2": {
    hook: "Nodo Giáp Tròn có lớp giáp ghép từ nhiều mảnh. Cắt rồi ghép lại có thể đổi hẳn hình dáng, nhưng không phải mọi đại lượng đều thay đổi.",
    wonder: "Nodo cắt một tấm giáp hình chữ nhật thành hai phần rồi ghép lại không chồng lên nhau: tổng diện tích có đổi không?",
    practice: "Tấm giáp của Nodo là một lưới 2×2. Có bao nhiêu hình vuông tất cả?",
  },
  "geometry-3": {
    hook: "Trên cánh của Ptero Hình Thoi có những ô vân nhỏ. Hình lớn tạo từ nhiều ô nhỏ rất dễ trốn khỏi mắt khi ta đếm vội.",
    wonder: "Cánh Ptero có một mảng vân lưới 2×3 gồm 6 ô nhỏ. Có tất cả bao nhiêu hình chữ nhật?",
    practice: "Dải vân trên cánh Ptero là lưới 1×4. Có bao nhiêu hình chữ nhật tất cả?",
  },
  "geometry-4": {
    hook: "Mamen Cổ Cung cúi nhìn bóng mình dưới hồ pha lê: có những hình khi gấp đôi thì hai nửa trùng khít nhau.",
    wonder: "Mamen xoay một phiến pha lê hình vuông một phần tư vòng. Phiến pha lê có đổi hình không?",
    practice: "Phiến pha lê hình vuông của Mamen có bao nhiêu trục đối xứng?",
  },
  "geometry-5": {
    hook: "Sai Giáp Khối có lớp giáp gồm những khối nhỏ ghép sát nhau không chừa khe. Lát kín là một bài toán hình học thật sự.",
    wonder: "Vì sao giáp hình vuông của Sai phủ kín lưng, còn giáp hình tròn thì để lại khe?",
    practice: "Sai muốn lát kín nền hang bằng các bản sao cùng kích thước của một hình. Hình nào chắc chắn lát kín?",
  },
  "geometry-6": {
    hook: "Toro Khiên Tam Giác thiết kế sân phơi nắng bằng những ô đá. Viền càng ngắn thì càng ít gai phải dựng quanh sân.",
    wonder: "Cùng 24 ô đá, sân hình chữ nhật nào của Toro cần ít đường viền nhất?",
    practice: "Toro có 24 ô đá. Sân hình nào có chu vi nhỏ nhất?",
  },

  // ===== Dữ liệu — Bờ Biển San Hô =====
  "data-1": {
    hook: "Ovi Ấp Trứng từng bị hiểu lầm là kẻ trộm trứng chỉ vì người ta kết luận quá vội. Dữ liệu kể chuyện, nhưng phải hỏi nó đến từ đâu.",
    wonder: "Hỏi 10 bạn khủng long ở Bờ Biển San Hô thì 6 bạn thích tắm biển. Có chắc cả đảo thích tắm biển không? Vì sao?",
    practice: "Bữa sáng của Ovi có 2 loại quả và 3 loại hạt. Chọn 1 quả, 1 hạt có bao nhiêu cách?",
  },
  "data-2": {
    hook: "Maia Mẹ Hiền đếm từng quả trứng trong tổ. Đếm khả năng bằng trí nhớ rất dễ trùng; một sơ đồ cây giữ hộ ta mọi nhánh.",
    wonder: "Có 2 lối từ tổ Maia ra bãi san hô và 3 lối từ bãi san hô ra bờ biển. Có bao nhiêu hành trình từ tổ ra bờ biển?",
    practice: "Maia chuẩn bị bữa cho con: 3 loại lá làm món chính và 2 loại quả tráng miệng. Chọn mỗi loại một món có bao nhiêu cách?",
  },
  "data-3": {
    hook: "Đàn Galli Chạy Đàn chạy dọc bãi biển mỗi sáng. Một con về nhất ba lần liền không có nghĩa lần sau chắc chắn là nó.",
    wonder: "Giỏ vỏ ốc có 3 vỏ đỏ và 1 vỏ xanh. Nhắm mắt lấy một vỏ, màu nào dễ xuất hiện hơn?",
    practice: "Galli nhặt vào giỏ 2 vỏ ốc vàng và 5 vỏ ốc tím. Nhắm mắt lấy một vỏ, màu nào dễ lấy được hơn?",
    explanation: "Có 5 vỏ tím nhưng chỉ 2 vỏ vàng.",
  },
  "data-4": {
    hook: "Micro Tí Hon vẽ biểu đồ số dấu chân trên cát. Hai cột trông chênh rất xa có thể chỉ khác nhau rất ít.",
    wonder: "Hai cột dấu chân trông chênh rất xa có thể chỉ khác nhau 1 dấu chân không?",
    practice: "Biểu đồ của Micro: thứ Hai có 48 dấu chân, thứ Ba có 50 dấu chân. Chênh lệch là bao nhiêu?",
  },
  "data-5": {
    hook: "Argen Khổng Lồ đứng chắn giữa hai lối đi. Đội thám hiểm tung đồng xu để chọn lối—ngẫu nhiên nghĩa là đoán được khả năng, nhưng không chắc từng lần.",
    wonder: "Đội thám hiểm tung đồng xu 10 lần để chọn đi bên trái hay bên phải Argen. Có chắc chắn được 5 lần ngửa không?",
    practice: "Tung một đồng xu để chọn lối vòng qua Argen. Có bao nhiêu kết quả có thể?",
  },
  "data-6": {
    hook: "Lepto Chân Mảnh muốn biết cả đảo thích trò chơi nào. Hỏi đúng người mới có câu trả lời đúng.",
    wonder: "Chỉ hỏi đội chạy của Lepto về trò chơi yêu thích thì có đại diện cho cả đảo không?",
    practice: "Lepto muốn biết món ăn yêu thích của cả lớp thám hiểm. Nên hỏi ai?",
  },

  // ===== Logic — Hang Động Băng =====
  "word-1": {
    hook: "Cửa Hang Động Băng bị khoá. Trood Thông Minh lần dấu vết từ kết quả quay về điểm bắt đầu như một thám tử.",
    wonder: "Trood bỏ một số vào máy băng: ×4 rồi +6, ra 38. Con sẽ tháo chiếc máy theo thứ tự nào?",
    practice: "Trood có một số viên đá băng, nhặt thêm 15 viên thì có 43 viên. Lúc đầu Trood có bao nhiêu viên?",
  },
  "word-2": {
    hook: "Trong hang, Deino đếm dấu chân của hai loài: loài đi hai chân và loài đi bốn chân. Đôi khi một giả sử sai có chủ đích lại là đường nhanh nhất tới đáp án.",
    wonder: "Có 5 con khủng long gồm loài đi hai chân và loài đi bốn chân, tổng 14 chân. Nếu giả sử tất cả đều đi hai chân, ta thiếu bao nhiêu chân?",
    practice: "Có 6 con khủng long gồm loài đi hai chân và loài đi bốn chân, tổng 18 chân. Có bao nhiêu con đi bốn chân?",
    explanation: "Nếu cả 6 con đi hai chân thì có 12 chân, thiếu 6 chân; mỗi con đi bốn chân thêm 2 chân nên có 3 con đi bốn chân.",
  },
  "word-3": {
    hook: "Cerato Sừng Mũi bán vé vào Hang Động Băng. Có bài toán không chỉ có một đáp án—thử thách là tìm đủ mọi khả năng.",
    wonder: "Vé vào hang giá 12 nghìn. Chỉ dùng đồng 2 nghìn và 5 nghìn để trả đúng 12 nghìn. Có bao nhiêu cách?",
    practice: "Vé cho khủng long con giá 10 nghìn. Dùng đồng 2 nghìn và 5 nghìn trả đúng 10 nghìn. Có bao nhiêu cách?",
  },
  "word-4": {
    hook: "Thesce Đuôi Cứng nhận được những mẩu giấy manh mối trong hang. Có manh mối đủ để tìm ra đáp án, có manh mối còn thiếu.",
    wonder: "Hai túi đá băng của Thesce có tổng cộng 10 viên. Biết vậy đã đủ để tìm chính xác số viên mỗi túi chưa?",
    practice: "Manh mối của Thesce: tổng hai số là 10. Có xác định duy nhất hai số không?",
  },
  "word-5": {
    hook: "Segno Nhanh Trí đoán mật mã cửa băng bằng cách thử rồi sửa. Thử có chiến lược thì mỗi lần sai lại gần đáp án hơn.",
    wonder: "Nếu Segno thử một số quá lớn, nên đổi số nào và đổi bao nhiêu?",
    practice: "Mật mã cửa băng: số đó × 5 + 2 = 37. Tìm số đó.",
  },
  "word-6": {
    hook: "Rex Vua Cuối Cùng canh cánh cửa cuối của Hang Động Băng: chỉ ai chứng minh đã tìm đủ mọi cách mới được đi qua.",
    wonder: "Tìm được vài cách thì khác với chứng minh đã tìm đủ như thế nào?",
    practice: "Rex chia 9 viên đá băng thành hai đống không rỗng, không tính đổi chỗ hai đống. Có bao nhiêu cách chia?",
  },
};

/** Buổi 4 "Chuyển giao đời sống": một nhiệm vụ ngắn làm ngoài màn hình cùng người lớn. */
export const AUTHENTIC_TASKS: Record<string, AuthenticTask> = {
  "number-1": { title: "Săn quy luật trên lịch tháng", steps: ["Mở lịch tháng này (lịch treo tường hoặc lịch trên máy của người lớn).", "Tìm 3 quy luật khác nhau, ví dụ cột thứ Hai, một đường chéo, các ngày chẵn.", "Viết mỗi quy luật bằng một câu và đoán ngày tiếp theo của mỗi quy luật."], share: "Quy luật nào làm con bất ngờ nhất? Vì sao nó luôn đúng?" },
  "number-2": { title: "Mật mã từ số nhà", steps: ["Chọn 3 chữ số khác nhau từ số nhà hoặc một biển số gần nhà.", "Liệt kê mọi số có ba chữ số tạo từ 3 chữ số đó, mỗi chữ số dùng một lần.", "Khoanh số lớn nhất, số nhỏ nhất và đếm xem có bao nhiêu số."], share: "Làm sao con chắc mình không bỏ sót số nào?" },
  "number-3": { title: "Chẵn lẻ trên mâm cơm", steps: ["Đoán trước: số bát cộng số đôi đũa trên mâm cơm là chẵn hay lẻ?", "Đếm để kiểm tra dự đoán.", "Thử lại với số cúc áo của hai người trong nhà."], share: "Con đoán đúng trước khi đếm được mấy lần? Mẹo của con là gì?" },
  "number-4": { title: "Thám tử số nhà", steps: ["Cùng người lớn đi dọc một dãy nhà hoặc lật một quyển sách.", "Tìm quy luật của dãy số nhà (hoặc số trang) và chỉ ra chỗ nào không theo quy luật.", "Giải thích vì sao ngoài đời lại có chỗ khác quy luật."], share: "Cần bao nhiêu bằng chứng thì con mới tin một quy luật?" },
  "number-5": { title: "Đếm ngược tới ngày vui", steps: ["Chọn một ngày sắp tới con mong chờ, như sinh nhật hay ngày nghỉ.", "Không lật lịch, tính xem ngày đó là thứ mấy bằng cách tách thành các tuần trọn vẹn.", "Lật lịch cùng người lớn để kiểm tra."], share: "Tách thành tuần giúp con tính nhanh hơn thế nào?" },
  "number-6": { title: "Nhịp xếp đồ của con", steps: ["Tự tạo một quy luật xếp đồ vật, ví dụ 1 thìa, 2 đũa, 1 thìa, 2 đũa…", "Viết quy luật ra giấy bằng một câu thật rõ.", "Nhờ người lớn đọc câu đó và xếp tiếp 5 bước—có giống ý con không?"], share: "Câu mô tả của con cần sửa gì để người khác làm đúng?" },
  "calculation-1": { title: "Đi chợ không cần máy tính", steps: ["Đi chợ cùng người lớn, chọn 2 món có giá gần số tròn (ví dụ 19 nghìn, 48 nghìn).", "Tính tổng bằng cách làm tròn rồi bù lại.", "So với hoá đơn hoặc máy tính của người lớn."], share: "Con làm tròn số nào để tính nhanh nhất?" },
  "calculation-2": { title: "Ba cách tính tiền đồ uống", steps: ["Chọn một món đồ uống giá dưới 50 nghìn và nhân với số người trong nhà.", "Tính bằng ít nhất 2 cách tách số khác nhau.", "Cả nhà bình chọn cách dễ nhất."], share: "Cách nào ngắn nhất? Cách nào giúp con hiểu nhất?" },
  "calculation-3": { title: "Chiếc máy số bằng lời", steps: ["Người lớn nghĩ một số, nhân 3 rồi cộng 4, chỉ nói kết quả cuối.", "Con tháo máy ngược lại để tìm số ban đầu.", "Đổi vai: con làm máy, người lớn đoán."], share: "Vì sao phải tháo phép cộng trước?" },
  "calculation-4": { title: "Cân bằng hai nhóm đồ chơi", steps: ["Xếp đồ chơi nhỏ thành hai nhóm và đếm từng nhóm.", "Chuyển vài món từ nhóm này sang nhóm kia: tổng có thay đổi không?", "Dùng ý đó để tính nhẩm tổng hai món giá 99 nghìn và 45 nghìn."], share: "Chuyển qua lại mà tổng không đổi—con giải thích thế nào?" },
  "calculation-5": { title: "Ước lượng giỏ hàng", steps: ["Trước khi thanh toán, ước lượng tổng tiền giỏ hàng bằng cách làm tròn từng món.", "So với số tiền trên hoá đơn.", "Tìm món làm ước lượng lệch nhiều nhất."], share: "Ước lượng của con lệch bao nhiêu? Làm sao để gần hơn?" },
  "calculation-6": { title: "Trò chơi số đích", steps: ["Chọn 4 chữ số từ một biển số xe hoặc tờ lịch.", "Dùng +, −, × và dấu ngoặc để tạo ra số 10 (hoặc số đích cả nhà chọn).", "Ghi lại mọi cách tìm được."], share: "Cách nào bất ngờ nhất?" },
  "measurement-1": { title: "Ước lượng rồi đo trong nhà", steps: ["Chọn 3 đồ vật: bàn học, cửa ra vào, cái thìa.", "Ước lượng kích thước từng vật và ghi đơn vị phù hợp.", "Đo bằng thước hoặc thước dây rồi so sánh."], share: "Đơn vị nào con chọn chưa hợp lúc đầu? Vì sao?" },
  "measurement-2": { title: "Khung ảnh bằng dây", steps: ["Lấy một sợi dây dài khoảng 60 cm.", "Uốn thành hình chữ nhật và đo các cạnh; thử 2–3 kích thước khác nhau.", "Ghi chiều dài, chiều rộng của mỗi khung."], share: "Chiều dài cộng chiều rộng luôn bằng bao nhiêu? Vì sao?" },
  "measurement-3": { title: "Rào vườn rau tí hon", steps: ["Dùng 12 que tăm làm hàng rào trên giấy ô li.", "Xếp các vườn hình chữ nhật khác nhau và đếm số ô bên trong.", "Tìm vườn rộng nhất."], share: "Hình nào rộng nhất? Con đoán trước có đúng không?" },
  "measurement-4": { title: "Bản đồ phòng ngủ", steps: ["Vẽ sơ đồ phòng trên giấy ô li, mỗi ô là một bước chân.", "Đặt giường, bàn vào sơ đồ theo đúng số ô.", "Dùng bản đồ đoán khoảng cách giữa hai đồ vật rồi đo thật bằng bước chân."], share: "Bản đồ đoán gần đúng tới đâu?" },
  "measurement-5": { title: "Lịch buổi sáng", steps: ["Ghi các việc buổi sáng và thời gian mỗi việc.", "Lập lịch để kịp giờ đi học, có 10 phút dự phòng.", "Thử theo lịch một ngày và ghi lại giờ thật."], share: "Việc nào tốn thời gian hơn con nghĩ?" },
  "measurement-6": { title: "Ngân sách bữa xế", steps: ["Cả nhà cho con một ngân sách tưởng tượng 50 nghìn đồng.", "Chọn món cho bữa xế theo giá thật ở cửa hàng gần nhà, giữ lại ít nhất 5 nghìn dự phòng.", "Tính số tiền còn lại."], share: "Con ưu tiên món nào? Vì sao?" },
  "geometry-1": { title: "Xếp 12 ô giấy", steps: ["Cắt 12 ô vuông giấy bằng nhau.", "Xếp thành các hình chữ nhật khác nhau và đếm cạnh ô để tìm chu vi.", "Ghi bảng: kích thước – diện tích – chu vi."], share: "Cùng diện tích nhưng chu vi khác—con giải thích thế nào?" },
  "geometry-2": { title: "Cắt ghép tờ giấy", steps: ["Lấy một tờ giấy hình chữ nhật đã kẻ ô.", "Cắt thành 2 phần và ghép thành một hình mới.", "Đếm ô và đo viền ngoài: cái gì đổi, cái gì không?"], share: "Điều gì không đổi dù hình dáng thay đổi?" },
  "geometry-3": { title: "Đếm hình trên gạch lát", steps: ["Tìm một mảng gạch lát hoặc ô cửa sổ dạng lưới.", "Đếm tất cả hình chữ nhật theo kích thước từ nhỏ đến lớn.", "Nhờ người lớn đếm riêng rồi so kết quả."], share: "Chia theo kích thước giúp con không bỏ sót ra sao?" },
  "geometry-4": { title: "Đối xứng quanh nhà", steps: ["Tìm 5 đồ vật có trục đối xứng: chiếc lá, ô cửa, chiếc khăn…", "Gấp giấy hoặc đặt gương để kiểm tra.", "Vẽ lại một đồ vật và kẻ trục đối xứng."], share: "Đồ vật nào có nhiều trục đối xứng nhất?" },
  "geometry-5": { title: "Thám tử lát nền", steps: ["Quan sát sàn nhà, tường hoặc vỉa hè: gạch có hình gì?", "Vẽ lại mẫu lát và chỉ ra vì sao không có khe.", "Tưởng tượng lát bằng hình tròn—khe hở nằm ở đâu?"], share: "Còn hình nào khác cũng lát kín được?" },
  "geometry-6": { title: "Thiết kế đáy hộp quà", steps: ["Dùng 24 ô giấy vuông bằng nhau.", "Thiết kế đáy hộp hình chữ nhật dùng đủ 24 ô sao cho viền ngắn nhất.", "Đo viền của 2–3 thiết kế."], share: "Thiết kế tiết kiệm nhất trông như thế nào?" },
  "data-1": { title: "Khảo sát bữa sáng", steps: ["Hỏi 5–8 người thân: bữa sáng thích món gì?", "Ghi bảng kiểm đếm rồi vẽ biểu đồ cột.", "Viết một điều chắc chắn và một điều chưa thể kết luận."], share: "Có thể nói “cả khu phố thích món này” không? Vì sao?" },
  "data-2": { title: "Phối đồ không sót", steps: ["Chọn 3 áo và 2 quần của con.", "Vẽ sơ đồ cây mọi cách phối.", "Mặc thử 2 cách con thích nhất."], share: "Sơ đồ cây giúp con không bỏ sót thế nào?" },
  "data-3": { title: "Túi hạt đậu", steps: ["Cho vào túi kín 3 hạt đậu màu này và 1 hạt màu khác (hoặc cúc áo).", "Đoán màu nào hay ra hơn, rồi bốc 20 lần, mỗi lần bỏ lại vào túi.", "Ghi kết quả và so với dự đoán."], share: "Kết quả có giống dự đoán không? Vì sao không chắc chắn?" },
  "data-4": { title: "Biểu đồ quanh ta", steps: ["Tìm một biểu đồ trên báo, tờ rơi hoặc bao bì.", "Đọc giá trị các cột và xem trục bắt đầu từ số mấy.", "Vẽ lại biểu đồ với trục bắt đầu từ 0."], share: "Biểu đồ mới trông khác ra sao?" },
  "data-5": { title: "Tung đồng xu cả nhà", steps: ["Tung một đồng xu 20 lần, ghi S hoặc N.", "Mỗi người trong nhà cũng tung 20 lần.", "Gộp kết quả của cả nhà."], share: "Càng tung nhiều lần, số lần sấp và ngửa thay đổi thế nào?" },
  "data-6": { title: "Cuộc khảo sát công bằng", steps: ["Chọn một câu hỏi cho cả nhà, ví dụ cuối tuần đi chơi đâu.", "Lên kế hoạch hỏi ai để công bằng cho mọi người.", "Hỏi thật và báo cáo kết quả."], share: "Nếu chỉ hỏi một người thì kết quả sai lệch thế nào?" },
  "word-1": { title: "Tiền tiêu vặt đi ngược", steps: ["Người lớn kể: “Bố có một số tiền, mua đồ hết 15 nghìn, còn lại 30 nghìn.”", "Con đi ngược để tìm số tiền lúc đầu.", "Con tự tạo một câu đố đi ngược cho người lớn giải."], share: "Khi đi ngược, con dùng phép tính nào thay cho phép tính cũ?" },
  "word-2": { title: "Đếm chân quanh nhà", steps: ["Chọn một nhóm gồm hai loại, ví dụ ghế 4 chân và ghế đẩu 3 chân.", "Người lớn chỉ nói tổng số ghế và tổng số chân; con giả sử để tìm mỗi loại.", "Đếm thật để kiểm tra."], share: "Giả sử tất cả cùng một loại giúp con thế nào?" },
  "word-3": { title: "Nhiều cách trả tiền", steps: ["Viết giấy mệnh giá 2 nghìn, 5 nghìn và 10 nghìn.", "Tìm mọi cách trả đúng 20 nghìn.", "Sắp xếp các cách để chắc chắn không sót."], share: "Con sắp xếp thế nào để biết đã đủ cách?" },
  "word-4": { title: "Đoán đồ vật bằng manh mối", steps: ["Người lớn nghĩ một đồ vật trong nhà và đưa từng manh mối.", "Sau mỗi manh mối, con nói: đã đủ để đoán chưa?", "Đổi vai: con đưa những manh mối vừa đủ."], share: "Manh mối nào giúp nhiều nhất? Manh mối nào thừa?" },
  "word-5": { title: "Thử và sửa khi rót nước", steps: ["Dùng một cốc nhỏ để rót đầy một chai nước.", "Đoán cần bao nhiêu cốc, rót thử rồi sửa dự đoán.", "Ghi lại mỗi lần sửa."], share: "Sau mỗi lần thử, con sửa dự đoán theo hướng nào?" },
  "word-6": { title: "Chia kẹo không sót", steps: ["Lấy 8 viên kẹo chia cho hai người, ai cũng có ít nhất 1 viên.", "Liệt kê mọi cách chia, không tính đổi chỗ.", "Chứng minh cho người lớn thấy không còn cách nào khác."], share: "Làm sao con thuyết phục người khác là đã đủ cách?" },
};
