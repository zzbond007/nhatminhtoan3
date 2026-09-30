// Miền "Ước lượng và mô hình" — 6 chặng × 12 phiên bản × 3 dải.
import { byBand, clock, METRE_PLACES, mod, num, pick, type Band, type Q } from "./kit";

export function measurementQuestions(sequence: number, v: number, band: Band): Q[] {
  const easy = band === "support";

  if (sequence === 1) {
    // Tránh 150 cm (cách đều 1 m và 2 m) và để số đo thật luôn khác số dự đoán.
    const length = [80, 90, 100, 110, 120, 130, 170, 180, 190, 200, 210, 220][v];
    const estimate = Math.round(length / 100) * 100; const measured = length - 3 - mod(v, 4);
    const metres = easy ? 1 + mod(v, 3) : 3 + mod(v, 5); const extraCm = 20 + 5 * mod(v, 8);
    const km = 1 + mod(v, 3); const m = 250 + 50 * mod(v, 6); const walked = 400 + 50 * mod(v, 4); const whole = 2 + mod(v, 5);
    const near = length < 150 ? "Khoảng 1 m" : "Khoảng 2 m"; const far = length < 150 ? "Khoảng 2 m" : "Khoảng 1 m";
    return [
      pick(`Một chiếc bàn dài khoảng ${length} cm. Ước lượng hợp lý nhất theo mét là bao nhiêu?`, near, ["Khoảng 1 m", "Khoảng 2 m", "Khoảng 10 m"],
        ["1 mét bằng bao nhiêu xăng-ti-mét?", `1 m = 100 cm; 2 m = 200 cm. Đặt ${length} cm vào giữa hai mốc ấy.`, `Xem ${length} gần 100 hơn hay gần 200 hơn.`],
        `${length} cm gần ${length < 150 ? 100 : 200} cm, tức là ${near.toLocaleLowerCase("vi")}.`, "Ước lượng đơn vị",
        { wrong: { [far]: `So khoảng cách: từ ${length} đến 100 và từ ${length} đến 200, bên nào ngắn hơn?`, "Khoảng 10 m": "10 m là 1 000 cm, dài gần bằng một lớp học. Cái bàn không dài đến thế." } }),
      num(`Đổi ${metres} m ${extraCm} cm thành xăng-ti-mét.`, metres * 100 + extraCm,
        ["Mỗi mét bằng bao nhiêu xăng-ti-mét?", `${metres} m = ${metres} × 100 cm.`, `Đổi phần mét ra xăng-ti-mét rồi cộng thêm ${extraCm} cm.`],
        `${metres} m = ${metres * 100} cm; thêm ${extraCm} cm được ${metres * 100 + extraCm} cm.`, "Đổi đơn vị",
        { steps: 2, wrong: { [metres * 10 + extraCm]: "1 m bằng 100 cm, không phải 10 cm.", [metres + extraCm]: "Phải đổi mét ra xăng-ti-mét trước rồi mới cộng.", [metres * 100]: `Con quên cộng phần ${extraCm} cm.` } }),
      num(`Một sợi dây dự đoán dài ${estimate} cm, đo thật được ${measured} cm. Sai lệch bao nhiêu xăng-ti-mét?`, Math.abs(estimate - measured),
        ["Số dự đoán và số đo thật, số nào lớn hơn?", `So ${estimate} và ${measured}; lấy số lớn trừ số nhỏ.`, `Tính ${Math.max(estimate, measured)} − ${Math.min(estimate, measured)}.`],
        `${Math.max(estimate, measured)} − ${Math.min(estimate, measured)} = ${Math.abs(estimate - measured)} cm.`, "Kiểm chứng ước lượng",
        { wrong: { [estimate + measured]: "Sai lệch là phần chênh nhau, nên dùng phép trừ chứ không cộng." } }),
      pick(`Đơn vị nào phù hợp nhất để đo chiều dài ${METRE_PLACES[v]}?`, "Mét", ["Mi-li-mét", "Xăng-ti-mét", "Mét", "Ki-lô-mét"],
        ["Nơi này dài hơn hay ngắn hơn một sải tay của con?", "Sải tay người lớn dài khoảng 1 mét. Nơi này dài khoảng vài sải đến vài chục sải tay.", "Chọn đơn vị để số đo không quá lớn mà cũng không quá nhỏ."],
        "Mét phù hợp với kích thước một căn phòng hay một khoảng sân.", "Chọn đơn vị",
        { wrong: { "Mi-li-mét": "Mi-li-mét dùng cho vật rất nhỏ như bề dày quyển vở. Đo nơi này sẽ ra số khổng lồ.", "Xăng-ti-mét": "Xăng-ti-mét hợp với đồ vật trên bàn. Đo nơi này sẽ ra số hàng nghìn.", "Ki-lô-mét": "Ki-lô-mét dùng cho quãng đường xa như từ nhà đến tỉnh khác." } }),
      byBand(band,
        num(`${whole} m bằng bao nhiêu xăng-ti-mét?`, whole * 100,
          ["1 m bằng bao nhiêu xăng-ti-mét?", `1 m = 100 cm, nên ${whole} m = ${whole} × 100 cm.`, `Nhân ${whole} với 100.`],
          `${whole} × 100 = ${whole * 100} cm.`, "Chuyển giao",
          { wrong: { [whole * 10]: "1 m bằng 100 cm, không phải 10 cm." } }),
        num(`Một đoạn đường dài ${km} km và ${m} m. Tổng cộng bao nhiêu mét?`, km * 1000 + m,
          ["1 ki-lô-mét bằng bao nhiêu mét?", `${km} km = ${km} × 1 000 m.`, `Đổi phần ki-lô-mét ra mét rồi cộng thêm ${m} m.`],
          `${km} km = ${km * 1000} m; thêm ${m} m được ${km * 1000 + m} m.`, "Chuyển giao",
          { steps: 2, wrong: { [km * 100 + m]: "1 km bằng 1 000 m, không phải 100 m.", [km + m]: "Phải đổi ki-lô-mét ra mét trước rồi mới cộng." } }),
        num(`Một đoạn đường dài ${km} km ${m} m. Bạn Thỏ đã đi được ${walked} m. Bạn còn phải đi bao nhiêu mét?`, km * 1000 + m - walked,
          ["Cả đoạn đường dài bao nhiêu mét?", `${km} km ${m} m = ${km * 1000 + m} m.`, `Lấy ${km * 1000 + m} trừ quãng đã đi ${walked}.`],
          `Cả đường dài ${km * 1000 + m} m; còn ${km * 1000 + m} − ${walked} = ${km * 1000 + m - walked} m.`, "Chuyển giao",
          { steps: 3, wrong: { [km * 1000 + m]: "Đây là cả đoạn đường. Phải trừ quãng đã đi.", [km * 100 + m - walked]: "1 km bằng 1 000 m, không phải 100 m." } }),
      ),
    ];
  }

  if (sequence === 2) {
    const half = easy ? 8 + 2 * mod(v, 4) : 14 + 2 * mod(v, 7); const perimeter = 2 * half; const width = 3 + mod(v, 4); const length = half - width;
    const startHour = 8 + mod(v, 3); const startMinute = 10 + 5 * mod(v, 7); const duration = easy ? 15 + 5 * mod(v, 3) : 35 + 5 * mod(v, 5);
    const start = startHour * 60 + startMinute; const end = start + duration;
    const budget = easy ? 50 + 10 * mod(v, 4) : 100 + 20 * mod(v, 5); const items = easy ? 2 : 3 + mod(v, 3); const price = easy ? 10 + 5 * mod(v, 3) : 18 + 2 * mod(v, 4);
    const piece = easy ? 20 + 5 * mod(v, 6) : 70 + 5 * v; const overlap = 4 + mod(v, 4);
    const square = perimeter + 8;
    return [
      num(`Có ${perimeter} cm dây làm khung chữ nhật dài ${length} cm. Chiều rộng là bao nhiêu?`, width,
        ["Một chiều dài và một chiều rộng cộng lại bằng bao nhiêu phần của cả sợi dây?", `Nửa chu vi là ${perimeter} : 2 = ${half} cm, gồm một chiều dài và một chiều rộng.`, `Lấy ${half} trừ chiều dài ${length}.`],
        `Nửa chu vi ${half} cm; chiều rộng là ${half} − ${length} = ${width} cm.`, "Giới hạn vật liệu",
        { steps: 2, wrong: { [perimeter - length]: "Dây phải đi quanh khung: có HAI chiều dài và HAI chiều rộng. Hãy tìm nửa chu vi trước.", [half]: "Đây là nửa chu vi (một chiều dài cộng một chiều rộng). Còn phải trừ chiều dài." } }),
      pick(`Bắt đầu lúc ${clock(start)}, hoạt động ${duration} phút. Kết thúc lúc nào?`, clock(end), [clock(end), clock(end - 10), clock(end + 10)],
        ["Từ lúc bắt đầu đến giờ tròn kế tiếp còn bao nhiêu phút?", `Đến ${startHour + 1}:00 còn ${60 - startMinute} phút. So với ${duration} phút: đã qua giờ mới chưa?`, "Cộng số phút; nếu được 60 phút trở lên thì đổi 60 phút thành 1 giờ."],
        `${clock(start)} thêm ${duration} phút là ${clock(end)}.`, "Giới hạn thời gian",
        { steps: 2, wrong: { [clock(end - 10)]: "Con cộng thiếu 10 phút. Hãy cộng lại phần chục phút.", [clock(end + 10)]: "Con cộng thừa 10 phút. Hãy cộng lại phần chục phút." } }),
      num(`Có ${budget} nghìn đồng, mua ${items} món giá ${price} nghìn đồng. Còn bao nhiêu nghìn đồng?`, budget - items * price,
        ["Mua tất cả hết bao nhiêu tiền?", `${items} món giá ${price} nghìn: ${items} × ${price} = ${items * price} nghìn.`, `Lấy ${budget} trừ ${items * price}.`],
        `Mua hết ${items * price} nghìn; còn ${budget} − ${items * price} = ${budget - items * price} nghìn đồng.`, "Giới hạn ngân sách",
        { steps: 2, wrong: { [budget - price]: `Con mới trừ tiền một món. Có ${items} món.`, [items * price]: "Đây là số tiền đã tiêu. Câu hỏi là số tiền còn lại." } }),
      num(`Ba đoạn dây, mỗi đoạn ${piece} cm, nối thành một sợi. Mỗi trong 2 mối nối chồng ${overlap} cm. Dây mới dài bao nhiêu?`, 3 * piece - 2 * overlap,
        ["Ba đoạn nối thành một sợi thì có mấy chỗ nối?", `Ba đoạn dài ${3 * piece} cm. Hai mối nối, mỗi mối mất ${overlap} cm.`, `Lấy ${3 * piece} trừ 2 × ${overlap}.`],
        `3 × ${piece} = ${3 * piece}; trừ 2 × ${overlap} = ${2 * overlap}; còn ${3 * piece - 2 * overlap} cm.`, "Điều kiện ẩn",
        { steps: 2, wrong: { [3 * piece - 3 * overlap]: "Ba đoạn chỉ có hai mối nối, không phải ba.", [3 * piece]: "Chỗ nối bị chồng lên nhau nên dây ngắn đi." } }),
      byBand(band,
        num(`Có ${square} cm dây làm khung vuông. Mỗi cạnh dài bao nhiêu xăng-ti-mét?`, square / 4,
          ["Hình vuông có mấy cạnh bằng nhau?", `${square} cm chia đều cho 4 cạnh.`, `Tính ${square} : 4.`],
          `${square} : 4 = ${square / 4} cm.`, "Chuyển giao",
          { wrong: { [square / 2]: "Hình vuông có 4 cạnh, không phải 2." } }),
        num(`Có ${square + 8} cm dây. Cắt bớt 8 cm rồi uốn phần còn lại thành khung vuông. Mỗi cạnh dài bao nhiêu xăng-ti-mét?`, square / 4,
          ["Sau khi cắt, còn bao nhiêu xăng-ti-mét dây để làm khung?", `${square + 8} − 8 = ${square} cm dây cho 4 cạnh bằng nhau.`, `Tính ${square} : 4.`],
          `Còn ${square} cm; mỗi cạnh ${square} : 4 = ${square / 4} cm.`, "Chuyển giao",
          { steps: 2, wrong: { [(square + 8) / 4]: "Con quên cắt bớt 8 cm trước khi chia." } }),
        num(`Có ${2 * square + 8} cm dây. Làm hai khung vuông bằng nhau thì còn thừa 8 cm. Mỗi cạnh khung dài bao nhiêu xăng-ti-mét?`, square / 4,
          ["Hai khung dùng hết bao nhiêu xăng-ti-mét dây?", `Dùng ${2 * square + 8} − 8 = ${2 * square} cm cho hai khung, mỗi khung ${square} cm.`, `Tính ${square} : 4.`],
          `Hai khung dùng ${2 * square} cm, mỗi khung ${square} cm; mỗi cạnh ${square / 4} cm.`, "Chuyển giao",
          { steps: 3, wrong: { [square / 2]: "Đây là khi chia dây của một khung cho 2. Hình vuông có 4 cạnh.", [(2 * square) / 4]: "Con mới chia cho 4 cạnh mà quên có HAI khung." } }),
      ),
    ];
  }

  if (sequence === 3) {
    const half = easy ? 6 + mod(v, 4) : 10 + mod(v + (band === "stretch" ? 2 : 0), 6);
    const bestA = Math.floor(half / 2); const bestB = Math.ceil(half / 2); const thin = Math.max(2, bestA - 2);
    const best = `${bestA}×${bestB}`; const long = `1×${half - 1}`; const mid = `${thin}×${half - thin}`; const two = `2×${half - 2}`;
    const length = bestB + 1; const width = half - length;
    return [
      pick(`Có ${half * 2} m hàng rào làm hình chữ nhật cạnh nguyên. Hình nào có diện tích lớn nhất?`, best, [long, mid, best],
        ["Chiều dài và chiều rộng cộng lại phải bằng bao nhiêu?", `Nửa chu vi là ${half}. Tính diện tích: ${long} → ${half - 1}; ${mid} → ${thin * (half - thin)}.`, "Tính diện tích hình còn lại rồi so ba kết quả."],
        `${best} có diện tích ${bestA * bestB}, lớn nhất trong các hình có nửa chu vi ${half}.`, "Tối ưu diện tích",
        { steps: 2, wrong: { [long]: `Hình dài và hẹp: 1 × ${half - 1} chỉ được ${half - 1} ô.`, [mid]: `${thin} × ${half - thin} = ${thin * (half - thin)}. Thử hình có hai cạnh gần bằng nhau hơn.` } }),
      num(`Với chu vi ${half * 2} m, hình ${two} có diện tích bao nhiêu mét vuông?`, 2 * (half - 2),
        ["Diện tích đo phần bên trong hay đường bao quanh?", `Hình có 2 hàng, mỗi hàng ${half - 2} ô vuông 1 m.`, `Tính 2 × ${half - 2}.`],
        `Diện tích là 2 × ${half - 2} = ${2 * (half - 2)} m².`, "Phân biệt đại lượng",
        { wrong: { [half * 2]: "Đây là chu vi (đường bao quanh). Diện tích là số ô vuông bên trong.", [half]: "Đây là nửa chu vi (tổng hai cạnh). Diện tích là tích hai cạnh." } }),
      pick(`Hai hình cùng chu vi ${half * 2}: ${two} và ${best}. Hình nào rộng hơn?`, best, [two, best, "Bằng nhau"],
        ["“Rộng hơn” nghĩa là so đại lượng nào?", `Diện tích ${two} là ${2 * (half - 2)}.`, "Tính diện tích hình còn lại rồi so sánh."],
        `${bestA * bestB} lớn hơn ${2 * (half - 2)}.`, "So sánh phương án",
        { steps: 2, wrong: { [two]: `Tính thử: ${two} được ${2 * (half - 2)}, còn ${best} được bao nhiêu?`, "Bằng nhau": "Cùng chu vi chưa chắc cùng diện tích. Hãy tính diện tích từng hình." } }),
      pick(`Muốn chắc phương án tốt nhất với nửa chu vi ${half}, con cần làm gì?`, "Liệt kê mọi cặp cạnh rồi so diện tích", ["Đoán hình trông vuông nhất", "Liệt kê mọi cặp cạnh rồi so diện tích", "Chỉ thử một hình", "Cộng hai cạnh"],
        ["Làm sao biết không còn hình nào tốt hơn?", `Các cặp cạnh có tổng ${half}: 1 và ${half - 1}, 2 và ${half - 2}, …`, "Khi đã xét hết các cặp thì mới kết luận được."],
        "Thử có hệ thống giúp chứng minh không có phương án tốt hơn.", "Chứng minh tối ưu",
        { wrong: { "Đoán hình trông vuông nhất": "Đoán có thể đúng, nhưng chưa phải bằng chứng. Cần so diện tích của mọi cặp.", "Chỉ thử một hình": "Một hình thì chưa có gì để so sánh.", "Cộng hai cạnh": `Mọi hình đều có tổng hai cạnh là ${half}, nên phép cộng không phân biệt được.` } }),
      byBand(band,
        num(`Vườn chữ nhật có nửa chu vi ${half} m, chiều dài ${length} m. Chiều rộng là bao nhiêu mét?`, width,
          ["Nửa chu vi gồm những cạnh nào?", `Nửa chu vi = dài + rộng: ${length} + □ = ${half}.`, `Tính ${half} − ${length}.`],
          `${half} − ${length} = ${width} m.`, "Chuyển giao",
          { wrong: { [half + length]: "Nửa chu vi đã gồm cả chiều dài, nên phải trừ chứ không cộng." } }),
        num(`Vườn chữ nhật có nửa chu vi ${half} m, chiều dài ${length} m. Diện tích vườn là bao nhiêu mét vuông?`, length * width,
          ["Muốn tính diện tích, con còn thiếu số đo nào?", `Chiều rộng: ${half} − ${length} = ${width} m.`, `Tính ${length} × ${width}.`],
          `Rộng ${width} m; diện tích ${length} × ${width} = ${length * width} m².`, "Chuyển giao",
          { steps: 2, wrong: { [width]: "Đây là chiều rộng. Diện tích là dài nhân rộng.", [half * length]: "Nửa chu vi không phải chiều rộng. Hãy tìm chiều rộng trước." } }),
        num(`Dùng hết ${half * 2} m hàng rào làm vườn chữ nhật dài ${length} m. Diện tích vườn là bao nhiêu mét vuông?`, length * width,
          ["Hàng rào đi quanh vườn: nửa chu vi là bao nhiêu?", `Nửa chu vi ${half * 2} : 2 = ${half} m; chiều rộng ${half} − ${length} = ${width} m.`, `Tính ${length} × ${width}.`],
          `Nửa chu vi ${half}; rộng ${width}; diện tích ${length} × ${width} = ${length * width} m².`, "Chuyển giao",
          { steps: 3, wrong: { [length * (half * 2 - length)]: "Hàng rào đi quanh vườn, nên phải lấy nửa chu vi trước khi trừ chiều dài.", [width]: "Đây là chiều rộng. Diện tích là dài nhân rộng." } }),
      ),
    ];
  }

  if (sequence === 4) {
    const scale = easy ? 2 + mod(v, 4) : 5 * (1 + mod(v, 5)); const units = 4 + mod(v, 8);
    return [
      num(`Trên sơ đồ, mỗi ô biểu diễn ${scale} m. Đường đi dài ${units} ô thì ngoài thực tế dài bao nhiêu mét?`, scale * units,
        ["Mỗi ô trên sơ đồ ứng với bao nhiêu mét thật?", `${units} ô, mỗi ô ${scale} m: ${scale} + ${scale} + … (${units} lần).`, `Tính ${units} × ${scale}.`],
        `${units} × ${scale} = ${scale * units} m.`, "Tỉ lệ trực quan",
        { wrong: { [units + scale]: "Mỗi ô đều dài như nhau, nên dùng phép nhân chứ không cộng hai số.", [units]: `Đây là số ô trên sơ đồ. Mỗi ô là ${scale} m ngoài thực tế.` } }),
      num(`Hai điểm cách nhau ${units + 2} đoạn, mỗi đoạn ${scale} m. Khoảng cách thật là bao nhiêu mét?`, (units + 2) * scale,
        ["Khoảng cách được tạo bởi các điểm hay các đoạn?", `${units + 2} đoạn nối tiếp, mỗi đoạn ${scale} m.`, `Tính ${units + 2} × ${scale}.`],
        `${units + 2} × ${scale} = ${(units + 2) * scale} m.`, "Đếm đoạn",
        { wrong: { [(units + 3) * scale]: "Con đếm số điểm. Khoảng cách tính theo số ĐOẠN.", [(units + 1) * scale]: "Con đếm thiếu một đoạn." } }),
      num(`Sơ đồ dùng 1 cm thay cho ${scale} m. Đo được ${units} cm thì thật dài bao nhiêu mét?`, scale * units,
        ["Mỗi xăng-ti-mét trên sơ đồ ứng với bao nhiêu mét thật?", `1 cm → ${scale} m; 2 cm → ${2 * scale} m; …`, `Tính ${units} × ${scale}.`],
        `${units} × ${scale} = ${scale * units} m.`, "Đổi mô hình",
        { wrong: { [units]: `Đây là số đo trên sơ đồ (cm). Ngoài thực tế, mỗi cm là ${scale} m.` } }),
      num(`Đường thật dài ${scale * (units + 1)} m, mỗi ô là ${scale} m. Cần vẽ dài bao nhiêu ô?`, units + 1,
        ["Đây là bài đi xuôi (từ ô ra mét) hay đi ngược (từ mét về ô)?", `□ × ${scale} = ${scale * (units + 1)}.`, `Tính ${scale * (units + 1)} : ${scale}.`],
        `${scale * (units + 1)} : ${scale} = ${units + 1} ô.`, "Đi ngược tỉ lệ",
        { wrong: { [scale * (units + 1) * scale]: "Con đã nhân. Từ mét về ô là đi ngược, nên dùng phép chia.", [scale * (units + 1) - scale]: "Đi ngược phép nhân bằng phép chia, không phải phép trừ." } }),
      byBand(band,
        num(`Mỗi ô là ${scale} m. Đường dài 3 ô thì thật dài bao nhiêu mét?`, 3 * scale,
          ["Mỗi ô ứng với bao nhiêu mét?", `3 ô: ${scale} + ${scale} + ${scale}.`, `Tính 3 × ${scale}.`],
          `3 × ${scale} = ${3 * scale} m.`, "Chuyển giao",
          { wrong: { [3 + scale]: "Dùng phép nhân: 3 ô, mỗi ô dài như nhau." } }),
        num(`Hai tuyến dài ${units} ô và ${units + 3} ô, mỗi ô ${scale} m. Tuyến dài hơn chênh bao nhiêu mét?`, 3 * scale,
          ["Hai tuyến chênh nhau mấy ô?", `Chênh ${units + 3} − ${units} = 3 ô.`, `Đổi 3 ô ra mét: 3 × ${scale}.`],
          `Chênh 3 ô, tức là 3 × ${scale} = ${3 * scale} m.`, "Chuyển giao so sánh",
          { steps: 2, wrong: { 3: "Đây là số ô chênh nhau. Câu hỏi hỏi số mét.", [(2 * units + 3) * scale]: "Con tính tổng hai tuyến. Câu hỏi là phần chênh lệch." } }),
        num(`Đi từ A đến B dài ${units} ô, rồi từ B đến C dài ${units + 3} ô, mỗi ô ${scale} m. Đã đi được ${2 * scale} m. Còn bao nhiêu mét nữa thì tới C?`, (2 * units + 3) * scale - 2 * scale,
          ["Cả quãng đường từ A đến C dài bao nhiêu ô?", `Tất cả ${2 * units + 3} ô, tức là ${(2 * units + 3) * scale} m.`, `Lấy ${(2 * units + 3) * scale} trừ quãng đã đi ${2 * scale}.`],
          `A đến C dài ${(2 * units + 3) * scale} m; còn ${(2 * units + 3) * scale} − ${2 * scale} = ${(2 * units + 1) * scale} m.`, "Chuyển giao so sánh",
          { steps: 3, wrong: { [(2 * units + 3) * scale]: "Đây là cả quãng đường. Phải trừ phần đã đi.", [(units + 3) * scale - 2 * scale]: "Con mới tính đoạn B đến C. Còn đoạn A đến B nữa." } }),
      ),
    ];
  }

  if (sequence === 5) {
    const startH = 8 + mod(v, 4); const startM = 5 * mod(v + 2, 9); const start = startH * 60 + startM;
    const first = easy ? 15 + 5 * mod(v, 3) : 25 + 5 * mod(v, 5); const rest = 10 + 5 * mod(v, 3); const second = easy ? 10 + 5 * mod(v + 1, 3) : 20 + 5 * mod(v + 1, 5);
    const total = first + rest + second; const end = start + total; const firstEnd = start + first; const spare = 15 + 5 * mod(v, 4);
    const travel = rest + 5; const need = first + second + travel; const deadline = (startH + 3) * 60; const latest = deadline - need;
    const noCarry = `${startH}:${String(firstEnd % 60).padStart(2, "0")}`;
    const firstOptions = [clock(firstEnd), noCarry, clock(firstEnd + 10), clock(firstEnd - 10)].filter((value, index, all) => all.indexOf(value) === index).slice(0, 3);
    return [
      pick(`Bắt đầu ${clock(start)}, học ${first} phút. Kết thúc lúc nào?`, clock(firstEnd), firstOptions,
        ["Từ lúc bắt đầu đến giờ tròn kế tiếp còn bao nhiêu phút?", `Đến ${startH + 1}:00 còn ${60 - startM} phút. So với ${first} phút: đã qua giờ mới chưa?`, "Cộng số phút; được 60 phút trở lên thì đổi 60 phút thành 1 giờ."],
        `Thêm ${first} phút vào ${clock(start)} được ${clock(firstEnd)}.`, "Mốc thời gian",
        { steps: 2, wrong: { [noCarry]: "Số phút đã vượt 60 nên phải đổi sang giờ kế tiếp.", [clock(firstEnd + 10)]: "Con cộng thừa 10 phút.", [clock(firstEnd - 10)]: "Con cộng thiếu 10 phút." } }),
      num(`Một buổi gồm ${first} phút đọc, nghỉ ${rest} phút, rồi ${second} phút vẽ. Tổng bao nhiêu phút?`, total,
        ["Buổi này có mấy phần thời gian?", `Ba phần: ${first} phút, ${rest} phút và ${second} phút.`, `Tính ${first} + ${rest} + ${second}.`],
        `${first} + ${rest} + ${second} = ${total} phút.`, "Lịch nhiều phần",
        { wrong: { [first + second]: `Con quên ${rest} phút nghỉ. Thời gian nghỉ cũng là một phần của buổi.` } }),
      pick(`Một buổi gồm ${first} phút đọc, nghỉ ${rest} phút, rồi ${second} phút vẽ, bắt đầu lúc ${clock(start)}. Buổi đó kết thúc lúc nào?`, clock(end), [clock(end), clock(end - rest), clock(end + 10)],
        ["Cả buổi dài bao nhiêu phút?", `Cả buổi ${total} phút${total >= 60 ? `, tức là 1 giờ ${total - 60} phút` : ""}.`, `Cộng thời gian ấy vào ${clock(start)}; được 60 phút thì đổi thành 1 giờ.`],
        `${clock(start)} thêm ${total} phút là ${clock(end)}.`, "Lập lịch",
        { steps: 2, wrong: { [clock(end - rest)]: `Con quên ${rest} phút nghỉ giữa buổi.`, [clock(end + 10)]: "Con cộng thừa 10 phút." } }),
      num(`Có ${total + spare} phút. Dùng ${first} phút đọc, ${rest} phút nghỉ và ${second} phút vẽ. Còn lại bao nhiêu phút?`, spare,
        ["Ba phần đã dùng hết bao nhiêu phút?", `Đã dùng ${first} + ${rest} + ${second} = ${total} phút trong ${total + spare} phút.`, `Tính ${total + spare} − ${total}.`],
        `${total + spare} − ${total} = ${spare} phút.`, "Khoảng trống",
        { wrong: { [spare + rest]: "Thời gian nghỉ cũng đã nằm trong buổi, nên không được tính là còn lại." } }),
      byBand(band,
        num(`Hai hoạt động dài ${first} phút và ${second} phút. Tổng thời gian là bao nhiêu phút?`, first + second,
          ["Cần gộp mấy khoảng thời gian?", `${first} phút rồi ${second} phút nối tiếp nhau.`, `Tính ${first} + ${second}.`],
          `${first} + ${second} = ${first + second} phút.`, "Chuyển giao",
          { wrong: { [first]: "Đây mới là hoạt động thứ nhất. Con cộng thêm hoạt động thứ hai.", [total]: "Câu này không có thời gian nghỉ: chỉ cộng hai hoạt động." } }),
        pick(`Hai hoạt động dài ${first} và ${second} phút, giữa chúng cần ${travel} phút di chuyển. Bắt đầu lúc ${clock(start)} thì xong lúc nào?`, clock(start + need), [clock(start + need), clock(start + first + second), clock(start + need + 10)],
          ["Tất cả cần bao nhiêu phút, kể cả lúc di chuyển?", `${first} + ${travel} + ${second} = ${need} phút.`, `Cộng ${need} phút vào ${clock(start)}; được 60 phút thì đổi thành 1 giờ.`],
          `Cần ${need} phút; ${clock(start)} thêm ${need} phút là ${clock(start + need)}.`, "Chuyển giao",
          { steps: 2, wrong: { [clock(start + first + second)]: `Con quên ${travel} phút di chuyển.`, [clock(start + need + 10)]: "Con cộng thừa 10 phút." } }),
        pick(`Hai hoạt động dài ${first} và ${second} phút, giữa chúng cần ${travel} phút di chuyển. Phải xong trước ${clock(deadline)}. Muộn nhất phải bắt đầu lúc nào?`, clock(latest), [clock(latest), clock(latest + travel), clock(latest - 10)],
          ["Đây là bài đi xuôi hay đi ngược thời gian?", `Tất cả cần ${first} + ${travel} + ${second} = ${need} phút. Lùi ${need} phút kể từ ${clock(deadline)}.`, "Lùi từng giờ trước, rồi lùi số phút còn lại."],
          `Cần ${need} phút; lùi từ ${clock(deadline)} được ${clock(latest)}.`, "Chuyển giao",
          { steps: 3, wrong: { [clock(latest + travel)]: `Con quên ${travel} phút di chuyển, nên bắt đầu như vậy sẽ bị trễ.`, [clock(latest - 10)]: "Giờ này vẫn kịp, nhưng chưa phải muộn nhất." } }),
      ),
    ];
  }

  const budget = easy ? 50 + 10 * mod(v, 4) : 100 + 20 * mod(v, 6); const price = easy ? 10 + 5 * mod(v, 2) : 15 + 5 * mod(v, 5);
  const reserve = easy ? 10 : 20 + 10 * mod(v, 3); const usable = budget - reserve; const quantity = Math.floor(usable / price);
  const need = 20 + mod(v, 8); const box = 6 + mod(v, 3); const boxes = Math.ceil(need / box);
  const cost = 3 * price + 5;
  return [
    num(`Có ${budget} nghìn đồng, mua 3 món giá ${price} nghìn đồng. Còn bao nhiêu nghìn đồng?`, budget - 3 * price,
      ["Ba món hết bao nhiêu tiền?", `3 × ${price} = ${3 * price} nghìn.`, `Lấy ${budget} trừ ${3 * price}.`],
      `${budget} − ${3 * price} = ${budget - 3 * price} nghìn đồng.`, "Ngân sách",
      { steps: 2, wrong: { [budget - price]: "Con mới trừ tiền một món. Có 3 món.", [3 * price]: "Đây là số tiền đã tiêu. Câu hỏi là số tiền còn lại." } }),
    num(`Có ${budget} nghìn đồng và phải để lại ${reserve} nghìn. Mua được nhiều nhất bao nhiêu món giá ${price} nghìn?`, quantity,
      ["Số tiền thật sự được tiêu là bao nhiêu?", `Được tiêu ${budget} − ${reserve} = ${usable} nghìn.`, `Xem ${usable} nghìn mua được mấy món ${price} nghìn mà không vượt quá.`],
      `Được tiêu ${usable} nghìn; mua được ${quantity} món (${quantity} × ${price} = ${quantity * price}).`, "Tối đa trong giới hạn",
      { steps: 2, wrong: { [Math.floor(budget / price)]: `Con quên để lại ${reserve} nghìn trước khi mua.`, [quantity + 1]: `${quantity + 1} món hết ${(quantity + 1) * price} nghìn, vượt quá ${usable} nghìn được tiêu.` } }),
    num(`Cần ít nhất ${need} chiếc bút, mỗi hộp có ${box} chiếc. Phải mua ít nhất bao nhiêu hộp?`, boxes,
      ["Có mua lẻ một phần hộp được không?", `${boxes - 1} hộp có ${(boxes - 1) * box} chiếc. Đã đủ ${need} chiếc chưa?`, "Thêm một hộp nữa rồi kiểm tra lại."],
      `${boxes - 1} hộp mới có ${(boxes - 1) * box} chiếc; cần ${boxes} hộp để có ${boxes * box} chiếc.`, "Làm tròn lên",
      { steps: 2, wrong: { [boxes - 1]: `${boxes - 1} hộp chỉ có ${(boxes - 1) * box} chiếc, chưa đủ ${need} chiếc.`, [boxes + 1]: `${boxes} hộp đã đủ rồi; mua thêm là thừa.` } }),
    pick(`Hai phương án giá ${budget - 10} nghìn và ${budget + 10} nghìn. Ngân sách ${budget} nghìn. Chọn được phương án nào?`, `${budget - 10} nghìn`, [`${budget - 10} nghìn`, `${budget + 10} nghìn`, "Cả hai", "Không phương án nào"],
      ["Giá nào không vượt quá ngân sách?", `So ${budget - 10} với ${budget}, rồi ${budget + 10} với ${budget}.`, "Chỉ giữ phương án có giá nhỏ hơn hoặc bằng ngân sách."],
      `Chỉ phương án ${budget - 10} nghìn nằm trong ngân sách.`, "Ra quyết định",
      { wrong: { [`${budget + 10} nghìn`]: `${budget + 10} lớn hơn ${budget}: thiếu 10 nghìn.`, "Cả hai": `Phương án ${budget + 10} nghìn vượt ngân sách.`, "Không phương án nào": `Phương án ${budget - 10} nghìn thấp hơn ngân sách, nên mua được.` } }),
    byBand(band,
      num(`Mua 2 món, mỗi món giá ${price} nghìn đồng. Hết bao nhiêu nghìn đồng?`, 2 * price,
        ["Hai món cùng giá thì tính bằng phép gì?", `${price} + ${price}.`, `Tính 2 × ${price}.`],
        `2 × ${price} = ${2 * price} nghìn đồng.`, "Chuyển giao",
        { wrong: { [price + 2]: "Hai món cùng giá: lấy giá nhân 2, không phải cộng thêm 2." } }),
      num(`Sau khi mua ${quantity} món giá ${price} nghìn từ ngân sách ${budget} nghìn, còn lại bao nhiêu nghìn?`, budget - quantity * price,
        ["Đã tiêu hết bao nhiêu tiền?", `${quantity} × ${price} = ${quantity * price} nghìn.`, `Lấy ${budget} trừ ${quantity * price}.`],
        `${budget} − ${quantity * price} = ${budget - quantity * price} nghìn đồng.`, "Chuyển giao",
        { steps: 2, wrong: { [quantity * price]: "Đây là số tiền đã tiêu. Câu hỏi là số tiền còn lại.", [budget - price]: `Con mới trừ tiền một món. Có ${quantity} món.` } }),
      num(`Có ${budget} nghìn đồng. Mua 2 món giá ${price} nghìn và 1 món giá ${price + 5} nghìn. Phải để lại ${reserve} nghìn. Còn được tiêu thêm bao nhiêu nghìn?`, budget - reserve - cost,
        ["Ba món hết bao nhiêu tiền?", `Ba món: 2 × ${price} + ${price + 5} = ${cost} nghìn. Được tiêu tất cả ${usable} nghìn.`, `Lấy ${usable} trừ ${cost}.`],
        `Được tiêu ${usable} nghìn; đã mua ${cost} nghìn; còn ${usable - cost} nghìn.`, "Chuyển giao",
        { steps: 3, wrong: { [budget - cost]: `Con quên để lại ${reserve} nghìn.`, [usable - 3 * price]: `Món thứ ba đắt hơn 5 nghìn: giá ${price + 5} nghìn.` } }),
    ),
  ];
}
