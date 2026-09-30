// Miền "Quy luật và cảm giác số" — 6 chặng × 12 phiên bản × 3 dải.
import { byBand, mod, num, pick, WEEKDAYS, type Band, type Q } from "./kit";

export function numberQuestions(sequence: number, v: number, band: Band): Q[] {
  const easy = band === "support";

  if (sequence === 1) {
    const start = easy ? 2 + mod(v, 6) : 3 + v;
    const step = easy ? 2 + mod(v, 4) : 3 + mod(v + (band === "stretch" ? 2 : 1), 6);
    const t = (index: number) => start + index * step;
    const a = start + 2; const d = step + 1;
    return [
      num(`Dãy ${t(0)}, ${t(1)}, ${t(2)}, ${t(3)}, … có số tiếp theo là bao nhiêu?`, t(4),
        ["Hai số đứng cạnh nhau cách nhau bao nhiêu?", `Khoảng cách: ${t(1)} − ${t(0)} = ${step}; ${t(2)} − ${t(1)} = ${step}.`, `Lấy số cuối ${t(3)} rồi cộng thêm khoảng cách ${step}.`],
        `Các khoảng cách đều bằng ${step}, nên số tiếp theo là ${t(3)} + ${step} = ${t(4)}.`, "Quy luật cộng",
        { wrong: { [t(3) + 1]: "Con mới cộng thêm 1. Dãy này không tăng từng đơn vị: hãy tính khoảng cách giữa hai số cạnh nhau.", [t(5)]: "Con đã nhảy hai bước. Đề chỉ hỏi số đứng ngay sau số cuối." } }),
      num(`Điền số còn thiếu: ${t(0)}, ${t(1)}, □, ${t(3)}, ${t(4)}.`, t(2),
        ["Khoảng cách ở bên trái và bên phải ô trống có bằng nhau không?", `${t(1)} − ${t(0)} = ${step} và ${t(4)} − ${t(3)} = ${step}.`, `Ô trống lớn hơn ${t(1)} đúng ${step} đơn vị.`],
        `Dãy tăng đều ${step}; số thiếu là ${t(1)} + ${step} = ${t(2)}.`, "Số bị che",
        { wrong: { [t(1) + 1]: "Con lấy số liền sau. Hãy dùng khoảng cách của dãy, không phải cộng 1.", [t(3)]: "Số này đã có trong dãy, đứng ngay sau ô trống." } }),
      pick(`Quy luật nào mô tả đúng dãy ${t(0)}, ${t(1)}, ${t(2)}, ${t(3)}?`, `Mỗi bước cộng ${step}`,
        [`Mỗi bước cộng ${step - 1}`, `Mỗi bước cộng ${step}`, "Mỗi bước nhân 2", "Cộng lần lượt 1, 2, 3"],
        ["Một quy luật đúng phải khớp với mấy bước của dãy?", `Tính ba khoảng cách: ${t(1)} − ${t(0)}, ${t(2)} − ${t(1)}, ${t(3)} − ${t(2)}.`, "Ba khoảng cách bằng nhau; chọn quy luật nói đúng khoảng cách đó."],
        `Mọi bước đều cộng ${step}.`, "Mô tả quy luật",
        { wrong: { [`Mỗi bước cộng ${step - 1}`]: `Con tính lệch 1. Thử lại: ${t(1)} − ${t(0)} bằng bao nhiêu?`, "Mỗi bước nhân 2": `Nhân 2 thì sau ${t(0)} phải là ${t(0) * 2}, không phải ${t(1)}.`, "Cộng lần lượt 1, 2, 3": "Quy luật này có khoảng cách lớn dần. Ở dãy đã cho, các khoảng cách bằng nhau." } }),
      pick(`Bạn Sóc dự đoán số sau ${t(3)} là ${t(4) + 1}. Dự đoán ấy đúng hay sai?`, "Sai", ["Đúng", "Sai", "Chưa đủ dữ kiện"],
        ["Quy luật của dãy cho số tiếp theo là bao nhiêu?", `Mỗi bước tăng ${step}; bạn Sóc đã tăng ${step + 1}.`, `So ${t(3)} + ${step} với con số bạn Sóc đoán.`],
        `Dự đoán lệch 1 đơn vị; số đúng là ${t(4)}.`, "Kiểm chứng dự đoán",
        { wrong: { "Đúng": `Con kiểm tra lại: từ ${t(3)} đến ${t(4) + 1} là tăng ${step + 1}, khác các bước trước.`, "Chưa đủ dữ kiện": "Bốn số đầu đã đủ cho thấy dãy tăng đều, nên ta kiểm tra được dự đoán." } }),
      byBand(band,
        num(`Một dãy bắt đầu từ ${a}, mỗi bước cộng ${d}. Số thứ ba là bao nhiêu?`, a + 2 * d,
          ["Từ số thứ nhất đến số thứ ba có mấy bước nhảy?", `Sơ đồ: ${a} → □ → □, mỗi mũi tên là cộng ${d}.`, `Cộng ${d} hai lần, bắt đầu từ ${a}.`],
          `Có 2 bước nhảy: ${a} + 2 × ${d} = ${a + 2 * d}.`, "Chuyển giao",
          { wrong: { [a + 3 * d]: "Con đã nhảy ba bước. Từ số thứ nhất đến số thứ ba chỉ có hai bước.", [a + d]: "Đây là số thứ hai. Con cần nhảy thêm một bước nữa." } }),
        num(`Một dãy bắt đầu từ ${a}, mỗi bước cộng ${d}. Số thứ sáu là bao nhiêu?`, a + 5 * d,
          ["Từ số thứ nhất đến số thứ sáu có mấy bước nhảy?", `Có 5 bước nhảy, mỗi bước ${d}.`, `Tính 5 × ${d} rồi cộng vào ${a}.`],
          `Có 5 lần cộng ${d}: ${a} + 5 × ${d} = ${a + 5 * d}.`, "Chuyển giao",
          { steps: 2, wrong: { [a + 6 * d]: "Con đã tính 6 bước nhảy. Sáu số thì chỉ có năm khoảng cách.", [a + 5]: `Con cộng số bước mà quên mỗi bước dài ${d}.` } }),
        num(`Một dãy tăng đều có số thứ nhất là ${a} và số thứ tư là ${a + 3 * d}. Số thứ bảy là bao nhiêu?`, a + 6 * d,
          ["Từ số thứ nhất đến số thứ tư có mấy bước nhảy?", `Ba bước nhảy làm dãy tăng ${3 * d}. Từ số thứ tư đến số thứ bảy cũng là ba bước.`, `Cộng thêm ${3 * d} vào số thứ tư.`],
          `Ba bước tăng ${3 * d}; ba bước nữa: ${a + 3 * d} + ${3 * d} = ${a + 6 * d}.`, "Chuyển giao",
          { steps: 3, wrong: { [a + 3 * d + 3]: "Con cộng thêm 3 (số bước) mà chưa tính mỗi bước dài bao nhiêu.", [2 * (a + 3 * d)]: "Số thứ bảy không phải gấp đôi số thứ tư. Hãy tìm lượng tăng của ba bước." } }),
      ),
    ];
  }

  if (sequence === 2) {
    const a = 1 + mod(v, 3); const b = a + 2 + mod(v, 2); const c = b + 2 + mod(Math.floor(v / 6), 2);
    const largest = `${c}${b}${a}`; const smallest = `${a}${b}${c}`;
    return [
      num(`Dùng ${a}, ${b}, ${c} đúng một lần để lập số có ba chữ số. Có tất cả bao nhiêu số khác nhau?`, 6,
        ["Nếu chọn xong chữ số hàng trăm, còn mấy cách xếp hai chữ số còn lại?", `Hàng trăm là ${a}: ${a}${b}${c}, ${a}${c}${b}. Làm tương tự với ${b} và ${c}.`, "Có 3 cách chọn hàng trăm, mỗi cách có 2 số."],
        "Ba chữ số khác nhau tạo 3 × 2 × 1 = 6 số.", "Đếm có hệ thống",
        { wrong: { 3: "Con mới đếm số cách chọn hàng trăm. Mỗi lựa chọn đó còn 2 cách xếp phần sau.", 9: "3 × 3 là khi được lặp chữ số. Ở đây mỗi chữ số chỉ dùng một lần." } }),
      num(`Số lớn nhất lập từ ${a}, ${b}, ${c}, mỗi chữ số dùng đúng một lần, là số nào?`, Number(largest),
        ["Hàng nào quyết định số lớn hay nhỏ trước tiên?", "Đặt chữ số lớn nhất vào hàng trăm, rồi đến hàng chục.", "Xếp ba chữ số theo thứ tự giảm dần."],
        `Xếp giảm dần được ${largest}.`, "Giá trị theo vị trí",
        { wrong: { [smallest]: "Đây là số nhỏ nhất. Muốn lớn nhất thì chữ số lớn phải đứng ở hàng trăm.", [`${c}${a}${b}`]: "Hàng trăm đã đúng. Hàng chục cũng cần chữ số lớn hơn trong hai chữ số còn lại." } }),
      num(`Có bao nhiêu số lập từ ${a}, ${b}, ${c} đúng một lần và lớn hơn ${b * 100}?`, 4,
        [`Chữ số hàng trăm có thể là những chữ số nào để số lớn hơn ${b * 100}?`, `Hàng trăm là ${b} hoặc ${c}; mỗi trường hợp có 2 cách xếp phần còn lại.`, "Đếm số của hai trường hợp rồi cộng lại."],
        `Hàng trăm là ${b} hoặc ${c}; mỗi lựa chọn có 2 số, tổng cộng 4.`, "Lọc điều kiện",
        { steps: 2, wrong: { 2: `Con mới tính các số bắt đầu bằng ${c}. Số bắt đầu bằng ${b} cũng lớn hơn ${b * 100}.`, 6: `Con đếm tất cả các số. Số bắt đầu bằng ${a} thì nhỏ hơn ${b * 100}.` } }),
      pick(`Số nào không thể lập từ ${a}, ${b}, ${c} nếu mỗi chữ số chỉ dùng một lần?`, `${a}${a}${c}`, [`${a}${b}${c}`, `${b}${c}${a}`, `${c}${a}${b}`, `${a}${a}${c}`],
        ["Trong mỗi số, có chữ số nào xuất hiện hai lần không?", "Đọc từng số và đánh dấu các chữ số đã dùng.", "Tìm số dùng một chữ số hai lần."],
        `${a}${a}${c} dùng chữ số ${a} hai lần nên vi phạm điều kiện.`, "Kiểm tra ràng buộc",
        { wrong: { [`${a}${b}${c}`]: "Số này dùng đủ ba chữ số, mỗi chữ số một lần.", [`${b}${c}${a}`]: "Số này dùng đủ ba chữ số, mỗi chữ số một lần.", [`${c}${a}${b}`]: "Số này dùng đủ ba chữ số, mỗi chữ số một lần." } }),
      byBand(band,
        num(`Dùng ${b} và ${c}, mỗi chữ số đúng một lần. Lập được bao nhiêu số có hai chữ số?`, 2,
          ["Chữ số nào có thể đứng ở hàng chục?", `Hàng chục là ${b} thì hàng đơn vị là ${c}; đổi chỗ thì sao?`, "Viết ra các số rồi đếm."],
          `Hai số: ${b}${c} và ${c}${b}.`, "Chuyển giao",
          { wrong: { 1: "Con thử đổi chỗ hai chữ số xem có thêm số nào không.", 4: "Mỗi chữ số chỉ dùng một lần, nên không có số lặp chữ số." } }),
        num(`Dùng 0, ${b}, ${c} đúng một lần. Có bao nhiêu số có ba chữ số?`, 4,
          ["Chữ số 0 có được đứng ở hàng trăm không?", `Hàng trăm có 2 lựa chọn: ${b} hoặc ${c}.`, "Mỗi lựa chọn hàng trăm có 2 cách xếp hai chữ số còn lại."],
          "Có 2 × 2 = 4 số; các cách bắt đầu bằng 0 bị loại.", "Chuyển giao có số 0",
          { steps: 2, wrong: { 6: "Con tính cả các số bắt đầu bằng 0. Số như vậy không phải số có ba chữ số." } }),
        num(`Dùng các chữ số 0, ${a}, ${b}, ${c}, mỗi chữ số nhiều nhất một lần, để lập số có ba chữ số. Có bao nhiêu số?`, 18,
          ["Hàng trăm có mấy lựa chọn, nếu không được dùng 0?", "Hàng trăm: 3 cách. Hàng chục: còn 3 chữ số. Hàng đơn vị: còn 2 chữ số.", "Nhân số lựa chọn của ba hàng với nhau."],
          "Hàng trăm 3 cách, hàng chục 3 cách, hàng đơn vị 2 cách: 3 × 3 × 2 = 18.", "Chuyển giao có số 0",
          { steps: 3, wrong: { 24: "4 × 3 × 2 là tính cả số bắt đầu bằng 0. Hàng trăm chỉ có 3 lựa chọn.", 6: "Con mới xếp ba chữ số. Ở đây có bốn chữ số để chọn." } }),
      ),
    ];
  }

  if (sequence === 3) {
    const odd1 = (easy ? 11 : 101) + 2 * v; const odd2 = (easy ? 25 : 205) + 2 * mod(v + 2, 10); const even = (easy ? 40 : 240) + 2 * v;
    const count = 3 + 2 * mod(v, 3); const times = 3 + 2 * mod(v, 2); const middle = 20 + v;
    const parityWrong = { "Không xác định": "Ta xác định được: chỉ cần nhìn chữ số tận cùng của mỗi số." };
    return [
      pick(`Không tính đầy đủ: ${odd1} + ${odd2} là số chẵn hay lẻ?`, "Chẵn", ["Chẵn", "Lẻ", "Không xác định"],
        ["Mỗi số hạng là số chẵn hay số lẻ?", `${odd1} và ${odd2} đều lẻ: mỗi số dư 1 khi chia thành các cặp.`, "Hai phần dư 1 ghép lại thành một cặp."],
        "Hai phần dư 1 ghép thành một cặp, nên lẻ cộng lẻ là chẵn.", "Bất biến chẵn–lẻ",
        { wrong: { "Lẻ": "Hai số lẻ mỗi số dư 1. Hai phần dư ấy ghép lại thì còn dư không?", ...parityWrong } }),
      pick(`Không tính đầy đủ: ${even} + ${odd1} là số chẵn hay lẻ?`, "Lẻ", ["Chẵn", "Lẻ", "Không xác định"],
        ["Số nào chẵn, số nào lẻ?", `${even} chẵn (chia hết thành các cặp), ${odd1} lẻ (dư 1).`, "Cộng lại thì phần dư 1 vẫn còn đó."],
        "Thêm một số chẵn không làm mất phần dư 1 của số lẻ.", "Dự đoán",
        { wrong: { "Chẵn": `Số ${odd1} dư 1 khi ghép cặp. Cộng thêm số chẵn thì phần dư ấy có mất đi không?`, ...parityWrong } }),
      pick(`Tổng của ${count} số lẻ là chẵn hay lẻ?`, "Lẻ", ["Chẵn", "Lẻ", "Không thể biết"],
        [`${count} là số chẵn hay số lẻ?`, "Ghép các số lẻ thành từng đôi: mỗi đôi có tổng chẵn.", "Sau khi ghép đôi, còn thừa ra mấy số lẻ?"],
        `${count} số lẻ ghép được thành các đôi và còn dư một số lẻ, nên tổng là lẻ.`, "Khái quát",
        { steps: 2, wrong: { "Chẵn": `Hai số lẻ thì tổng chẵn, nhưng ở đây có ${count} số: ghép đôi xong còn dư một số.`, "Không thể biết": "Không cần biết từng số: chỉ cần biết có bao nhiêu số lẻ." } }),
      pick(`Một số lẻ cộng 1 rồi nhân ${times}. Kết quả chắc chắn là gì?`, "Số chẵn", ["Số chẵn", "Số lẻ", "Không xác định"],
        ["Sau bước cộng 1, số lẻ trở thành số gì?", "Số lẻ + 1 = số chẵn. Thử với 7: 7 + 1 = 8.", `Một số chia được thành các cặp, nhân lên ${times} lần thì còn chia được thành các cặp không?`],
        "Sau bước đầu đã là số chẵn; phép nhân giữ tính chẵn.", "Chuỗi hai bước",
        { steps: 2, wrong: { "Số lẻ": `Nhân với số lẻ ${times} không làm mất tính chẵn đã có sau bước cộng 1.`, "Không xác định": "Dù số lẻ ban đầu là số nào, sau khi cộng 1 nó luôn là số chẵn." } }),
      byBand(band,
        pick(`Hai số liên tiếp ${middle} và ${middle + 1} có tổng là số chẵn hay lẻ?`, "Lẻ", ["Chẵn", "Lẻ", "Không xác định"],
          ["Trong hai số liên tiếp, có mấy số chẵn và mấy số lẻ?", "Hai số liên tiếp luôn gồm một số chẵn và một số lẻ.", "Chẵn cộng lẻ thì còn dư 1."],
          "Một số chẵn cộng một số lẻ cho tổng lẻ.", "Chuyển giao",
          { wrong: { "Chẵn": "Hai số liên tiếp không cùng chẵn hoặc cùng lẻ: một số chẵn, một số lẻ.", ...parityWrong } }),
        num(`Ba số liên tiếp có số giữa là ${middle}. Tổng của chúng là bao nhiêu?`, 3 * middle,
          ["Số bé và số lớn cách số giữa bao nhiêu?", `Ba số là ${middle - 1}, ${middle}, ${middle + 1}: số bé thiếu 1, số lớn thừa 1.`, `Bù qua lại thì ba số đều thành ${middle}; tính 3 lần số giữa.`],
          `Ba số là ${middle - 1}, ${middle}, ${middle + 1}; tổng bằng 3 × ${middle} = ${3 * middle}.`, "Chuyển giao đối xứng",
          { steps: 2, wrong: { [2 * middle]: "Con mới cộng số bé và số lớn. Còn số ở giữa nữa.", [3 * middle + 3]: "Con cộng ba số tăng dần từ số giữa. Số đầu tiên phải nhỏ hơn số giữa 1 đơn vị." } }),
        num(`Năm số liên tiếp có tổng là ${5 * middle}. Số lớn nhất trong năm số là bao nhiêu?`, middle + 2,
          ["Trong năm số liên tiếp, tổng gấp mấy lần số ở giữa?", `Tổng bằng 5 lần số giữa, nên số giữa là ${5 * middle} : 5.`, "Từ số giữa, đi thêm hai bước về phía lớn hơn."],
          `Số giữa là ${5 * middle} : 5 = ${middle}; số lớn nhất là ${middle} + 2 = ${middle + 2}.`, "Chuyển giao đối xứng",
          { steps: 3, wrong: { [middle]: "Đây là số ở giữa. Số lớn nhất đứng sau nó hai bước.", [middle + 4]: "Năm số liên tiếp: số lớn nhất chỉ hơn số giữa 2 đơn vị." } }),
      ),
    ];
  }

  if (sequence === 4) {
    const start = easy ? 2 + mod(v, 6) : 4 + v; const step = easy ? 2 + mod(v, 4) : 3 + mod(v, 5);
    const t = (index: number) => start + index * step;
    const odd = t(3) + 1; const g = 2 + mod(v, 4);
    const list = `${t(0)}, ${t(1)}, ${t(2)}, ${odd}, ${t(4)}`;
    return [
      num(`Số nào làm hỏng quy luật ${list}?`, odd,
        ["Các khoảng cách giữa hai số cạnh nhau có bằng nhau không?", `Khoảng cách lần lượt: ${step}, ${step}, ${step + 1}, ${step - 1}.`, "Hai khoảng cách lạ cùng dính tới một số. Đó là số nào?"],
        `${odd} lệch 1 so với số đúng ${t(3)}.`, "Phát hiện nhiễu",
        { steps: 2, wrong: { [t(4)]: `Số cuối vẫn khớp: nó cách ${t(2)} đúng hai bước ${step}.`, [t(2)]: `${t(2)} khớp với hai số đầu. Hãy xem số đứng ngay sau nó.` } }),
      num(`Dãy ${g}, ${2 * g}, ${4 * g}, ${8 * g}, … có số tiếp theo là bao nhiêu?`, 16 * g,
        ["Mỗi số gấp mấy lần số đứng trước?", `${2 * g} : ${g} = 2; ${4 * g} : ${2 * g} = 2.`, `Lấy số cuối ${8 * g} nhân với 2.`],
        `Dãy nhân 2 nên số tiếp theo là ${8 * g} × 2 = ${16 * g}.`, "Quy luật nhân",
        { wrong: { [12 * g]: "Con cộng thêm khoảng cách cũ. Ở dãy này khoảng cách cũng lớn dần: mỗi số gấp đôi số trước.", [10 * g]: `Con cộng thêm ${2 * g}. Hãy so bằng phép nhân thay vì phép cộng.` } }),
      num(`Dãy bắt đầu ${start}, tăng lần lượt 2, 4, 6, 8. Số thứ năm là bao nhiêu?`, start + 20,
        ["Các bước tăng có bằng nhau không?", `${start} → +2 → +4 → +6 → +8.`, "Cộng bốn phần tăng lại rồi thêm vào số đầu."],
        `Tổng phần tăng là 2 + 4 + 6 + 8 = 20; số thứ năm là ${start} + 20 = ${start + 20}.`, "Khoảng cách thay đổi",
        { steps: 2, wrong: { [start + 8]: "Con mới cộng bước cuối. Phải cộng cả bốn bước 2, 4, 6, 8.", [start + 32]: "Con cộng 8 bốn lần. Các bước tăng khác nhau: 2, rồi 4, rồi 6, rồi 8." } }),
      pick(`Quy luật “mỗi bước cộng ${step}” có khớp mọi số trong dãy ${t(0)}, ${t(1)}, ${t(2)}, ${odd}?`, "Không", ["Có", "Không", "Chỉ khớp số cuối"],
        ["Cần mấy bước không khớp để bác bỏ một quy luật?", `Bước cuối: ${odd} − ${t(2)} = ${step + 1}.`, "So khoảng cách của bước cuối với hai bước trước."],
        `Bước cuối tăng ${step + 1}, nên quy luật không khớp mọi bước.`, "Phản chứng",
        { wrong: { "Có": `Con kiểm tra bước cuối: ${odd} − ${t(2)} có bằng ${step} không?`, "Chỉ khớp số cuối": "Ngược lại: hai bước đầu khớp, chính bước cuối mới không khớp." } }),
      byBand(band,
        num(`Trong dãy ${t(0)}, ${t(1)}, ${t(2)}, … mỗi bước tăng bao nhiêu đơn vị?`, step,
          ["Lấy số sau trừ số trước thì được bao nhiêu?", `${t(1)} − ${t(0)} = □ và ${t(2)} − ${t(1)} = □.`, "Hai hiệu bằng nhau; đó là bước tăng."],
          `${t(1)} − ${t(0)} = ${step} và ${t(2)} − ${t(1)} = ${step}.`, "Chuyển giao",
          { wrong: { [t(1)]: "Đây là số thứ hai của dãy. Câu hỏi là khoảng cách giữa hai số." } }),
        num(`Sửa đúng một số để dãy ${list} tăng đều. Số thay vào là bao nhiêu?`, t(3),
          ["Ba số đầu tăng đều bao nhiêu mỗi bước?", `Ba số đầu cộng ${step} mỗi bước; số thứ tư đang là ${odd}.`, `Số thứ tư phải bằng ${t(2)} cộng bước tăng.`],
          `Thay ${odd} bằng ${t(3)} thì mọi khoảng cách đều là ${step}.`, "Chuyển giao sửa dữ liệu",
          { steps: 2, wrong: { [odd]: "Đây chính là số đang sai. Con cần tìm số thay thế.", [t(4)]: "Số cuối vẫn đúng. Số cần sửa là số thứ tư." } }),
        num(`Một dãy tăng đều bị chép sai một số: ${list}. Sau khi sửa, số thứ bảy của dãy là bao nhiêu?`, t(6),
          ["Dãy đúng tăng bao nhiêu mỗi bước?", `Ba số đầu cho thấy mỗi bước cộng ${step}. Số thứ năm ${t(4)} vẫn đúng.`, `Từ số thứ năm, nhảy thêm hai bước ${step}.`],
          `Mỗi bước cộng ${step}; số thứ bảy là ${t(4)} + 2 × ${step} = ${t(6)}.`, "Chuyển giao sửa dữ liệu",
          { steps: 3, wrong: { [t(5)]: "Đây là số thứ sáu. Con cần thêm một bước nữa.", [odd + 3 * step]: `Con tính tiếp từ số bị chép sai ${odd}. Hãy dùng số đúng.` } }),
      ),
    ];
  }

  if (sequence === 5) {
    const startDay = 1 + mod(v + 1, 6); const days = 8 + v; const resultDay = mod(startDay + days, 7);
    const hour = 1 + mod(v + 7, 11); const after = 13 + mod(v, 8); const resultHour = mod(hour + after - 1, 12) + 1;
    const period = 3 + mod(v, 4); const first = 2 + mod(v, 5);
    const turn = 10 + v; const colours = ["Xanh", "Đỏ", "Vàng"]; const colour = colours[mod(turn, 3)];
    const colourHelp = `Chia ${turn} cho 3 rồi xem số dư: dư 1 là Đỏ, dư 2 là Vàng, chia hết là Xanh.`;
    const target = 22 + v; const targetDay = WEEKDAYS[mod(startDay + target - 1, 7)];
    const fromDate = 3 + mod(v, 4); const toDate = 24 + mod(v, 5); const gap = toDate - fromDate; const farDay = WEEKDAYS[mod(startDay + gap, 7)];
    return [
      pick(`Hôm nay là ${WEEKDAYS[startDay]}. Sau ${days} ngày là thứ mấy?`, WEEKDAYS[resultDay],
        [WEEKDAYS[resultDay], WEEKDAYS[mod(resultDay + 1, 7)], WEEKDAYS[mod(resultDay + 2, 7)], WEEKDAYS[mod(resultDay + 6, 7)]],
        ["Sau đúng 7 ngày thì thứ có thay đổi không?", `${days} ngày = 7 ngày + ${days - 7} ngày.`, `Bỏ qua 7 ngày, rồi tiến ${days % 7} ngày kể từ ${WEEKDAYS[startDay]}.`],
        `Các tuần trọn vẹn không đổi thứ; ${days} chia 7 dư ${days % 7}, nên ta đến ${WEEKDAYS[resultDay]}.`, "Chu kỳ tuần",
        { steps: 2, wrong: { [WEEKDAYS[mod(resultDay + 1, 7)]]: "Con đếm dư một ngày. Ngày mai mới là ngày thứ nhất.", [WEEKDAYS[mod(resultDay + 2, 7)]]: `Con kiểm tra lại phép chia: ${days} chia 7 dư mấy?`, [WEEKDAYS[mod(resultDay + 6, 7)]]: "Con đếm thiếu một ngày: hôm nay không tính là ngày thứ nhất." } }),
      num(`Đồng hồ đang chỉ ${hour} giờ. Sau ${after} giờ sẽ chỉ mấy giờ?`, resultHour,
        ["Sau đúng 12 giờ, kim giờ chỉ vào đâu?", `${after} giờ = 12 giờ + ${after - 12} giờ.`, `Bỏ một vòng 12 giờ, rồi tiến ${after - 12} giờ kể từ ${hour} giờ (qua số 12 thì đếm lại từ 1).`],
        `Bỏ một vòng 12 giờ rồi tiến thêm ${after - 12} giờ: đồng hồ chỉ ${resultHour} giờ.`, "Chu kỳ 12",
        { steps: 2, wrong: { [hour + after]: "Mặt đồng hồ chỉ có 12 số: sau 12 giờ kim quay về chỗ cũ." } }),
      num(`Một hoạt động lặp lại mỗi ${period} ngày. Lần đầu vào ngày ${first}. Lần thứ tư vào ngày nào?`, first + 3 * period,
        ["Giữa lần thứ nhất và lần thứ tư có mấy khoảng cách?", `Lần 1 → lần 2 → lần 3 → lần 4: ba mũi tên, mỗi mũi tên ${period} ngày.`, `Cộng ${period} ba lần vào ngày ${first}.`],
        `Lần thứ tư cách lần đầu 3 chu kỳ: ${first} + 3 × ${period} = ${first + 3 * period}.`, "Mốc và khoảng",
        { steps: 2, wrong: { [first + 4 * period]: "Bốn lần thì chỉ có ba khoảng cách ở giữa.", [4 * period]: `Con quên ngày bắt đầu là ngày ${first}.` } }),
      pick(`Một đèn đổi màu theo vòng Đỏ – Vàng – Xanh. Lần 1 là Đỏ. Lần ${turn} là màu gì?`, colour, ["Đỏ", "Vàng", "Xanh"],
        ["Cứ sau mấy lần thì màu lặp lại?", `Mỗi vòng có 3 lần. ${turn} lần gồm mấy vòng trọn và dư mấy lần?`, "Dư 1 là màu đầu vòng, dư 2 là màu thứ hai, chia hết là màu cuối vòng."],
        `${turn} chia 3 dư ${turn % 3}, nên lần ${turn} là ${colour}.`, "Chu kỳ màu",
        { steps: 2, wrong: Object.fromEntries(colours.filter((name) => name !== colour).map((name) => [name, colourHelp])) }),
      byBand(band,
        pick(`Hôm nay là ${WEEKDAYS[startDay]}. Sau 7 ngày là thứ mấy?`, WEEKDAYS[startDay], [WEEKDAYS[startDay], WEEKDAYS[mod(startDay + 1, 7)], WEEKDAYS[mod(startDay + 6, 7)]],
          ["Một tuần có mấy ngày?", "Bảy ngày là vừa đúng một vòng của tuần.", "Đi hết một vòng thì ta quay về đâu?"],
          "Sau đúng một tuần, thứ lặp lại như cũ.", "Chuyển giao lịch",
          { wrong: { [WEEKDAYS[mod(startDay + 1, 7)]]: "Con đi dư một ngày. Bảy ngày là vừa tròn một tuần.", [WEEKDAYS[mod(startDay + 6, 7)]]: "Con đi thiếu một ngày. Bảy ngày là vừa tròn một tuần." } }),
        pick(`Ngày 1 là ${WEEKDAYS[startDay]}. Ngày ${target} là thứ mấy?`, targetDay, [targetDay, WEEKDAYS[mod(startDay + target, 7)], WEEKDAYS[mod(startDay + target - 2, 7)]],
          [`Từ ngày 1 đến ngày ${target} cách nhau bao nhiêu ngày?`, `Khoảng cách là ${target} − 1 = ${target - 1} ngày.`, `Chia ${target - 1} cho 7, rồi tiến phần dư kể từ ${WEEKDAYS[startDay]}.`],
          `Cách nhau ${target - 1} ngày; ${target - 1} chia 7 dư ${(target - 1) % 7}, nên đó là ${targetDay}.`, "Chuyển giao lịch",
          { steps: 2, wrong: { [WEEKDAYS[mod(startDay + target, 7)]]: `Con tiến ${target} ngày. Từ ngày 1 đến ngày ${target} chỉ cách ${target - 1} ngày.`, [WEEKDAYS[mod(startDay + target - 2, 7)]]: "Con tiến thiếu một ngày. Hãy tính lại khoảng cách giữa hai ngày." } }),
        pick(`Ngày ${fromDate} của tháng là ${WEEKDAYS[startDay]}. Ngày ${toDate} cùng tháng là thứ mấy?`, farDay, [farDay, WEEKDAYS[mod(startDay + gap + 1, 7)], WEEKDAYS[mod(startDay + gap + 6, 7)], WEEKDAYS[mod(startDay + toDate, 7)]].filter((name, index, all) => all.indexOf(name) === index),
          ["Hai ngày này cách nhau bao nhiêu ngày?", `Khoảng cách là ${toDate} − ${fromDate} = ${gap} ngày.`, `Chia ${gap} cho 7, rồi tiến phần dư kể từ ${WEEKDAYS[startDay]}.`],
          `Cách nhau ${gap} ngày; ${gap} chia 7 dư ${gap % 7}, nên đó là ${farDay}.`, "Chuyển giao lịch",
          { steps: 3, wrong: { [WEEKDAYS[mod(startDay + gap + 1, 7)]]: "Con tiến dư một ngày. Hãy tính lại hiệu của hai ngày.", [WEEKDAYS[mod(startDay + gap + 6, 7)]]: "Con tiến thiếu một ngày. Hãy tính lại hiệu của hai ngày.", [WEEKDAYS[mod(startDay + toDate, 7)]]: `Con tiến ${toDate} ngày. Phải trừ đi ngày bắt đầu là ngày ${fromDate}.` } }),
      ),
    ];
  }

  const start = 2 + mod(v, 8); const multiplier = easy ? 2 : 2 + mod(v, 3); const add = easy ? 1 + mod(v, 3) : 1 + mod(v, 5);
  const second = start * multiplier + add; const third = second * multiplier + add;
  const high = 20 + v;
  return [
    num(`Dãy bắt đầu ${start}; mỗi bước nhân ${multiplier} rồi cộng ${add}. Số thứ ba là bao nhiêu?`, third,
      ["Mỗi bước gồm mấy thao tác?", `Bước 1: ${start} × ${multiplier} + ${add} = ${second}.`, `Làm lại hai thao tác ấy với ${second}.`],
      `${start} → ${second} → ${third}.`, "Tạo theo luật",
      { steps: 2, wrong: { [second]: "Đây là số thứ hai. Số thứ ba cần thêm một bước nữa.", [second * multiplier]: `Ở bước hai con quên cộng ${add}.` } }),
    pick(`Mô tả nào tạo đúng dãy ${start}, ${start + 3}, ${start + 6}, ${start + 9}?`, "Mỗi bước cộng 3", ["Mỗi bước cộng 2", "Mỗi bước cộng 3", "Mỗi bước nhân 3", "Cộng lần lượt 1, 2, 3"],
      ["Hai số cạnh nhau cách nhau bao nhiêu?", `${start + 3} − ${start} = □; ${start + 6} − ${start + 3} = □.`, "Các khoảng cách bằng nhau; chọn mô tả nói đúng khoảng cách đó."],
      "Mỗi số sau hơn số trước 3.", "Mô tả rõ",
      { wrong: { "Mỗi bước cộng 2": `Cộng 2 thì sau ${start} phải là ${start + 2}.`, "Mỗi bước nhân 3": `Nhân 3 thì sau ${start} phải là ${start * 3}.`, "Cộng lần lượt 1, 2, 3": "Mô tả này có khoảng cách lớn dần; dãy đã cho tăng đều." } }),
    num(`Dãy bắt đầu ${high}, bớt lần lượt 1, 2, 3, 4. Số thứ năm là bao nhiêu?`, high - 10,
      ["Từ số thứ nhất đến số thứ năm có mấy lần bớt?", `${high} → −1 → −2 → −3 → −4.`, "Cộng bốn phần bị bớt lại, rồi trừ khỏi số đầu."],
      `Tổng bị bớt là 1 + 2 + 3 + 4 = 10; số thứ năm là ${high} − 10 = ${high - 10}.`, "Luật thay đổi",
      { steps: 2, wrong: { [high - 4]: "Con mới bớt lần cuối. Phải bớt cả bốn lần 1, 2, 3, 4." } }),
    pick(`Hai dãy cùng bắt đầu ${start}, ${start + 3}, ${start + 6}. Chỉ ba số này có đủ để khẳng định duy nhất một quy luật không?`, "Không", ["Có", "Không", "Chỉ khi số đầu chẵn"],
      ["Con có nghĩ ra hai cách khác nhau để viết số thứ tư không?", `Cách 1: cộng 3 mãi. Cách 2: cộng 3, cộng 3 rồi cộng 4, cộng 4, …`, "Nếu có hai quy luật cùng khớp thì ba số đã đủ chưa?"],
      "Ba số đầu có thể được giải thích bởi nhiều quy luật; cần thêm số hoặc lời mô tả.", "Tư duy phản biện",
      { wrong: { "Có": "Thử nghĩ một dãy khác cũng bắt đầu như vậy nhưng số thứ tư khác đi.", "Chỉ khi số đầu chẵn": "Chẵn hay lẻ không quyết định. Điều quan trọng là có nhiều quy luật cùng khớp ba số đầu." } }),
    byBand(band,
      num(`Tạo theo luật: bắt đầu ${start + 1}, mỗi bước cộng 2. Số thứ tư là bao nhiêu?`, start + 7,
        ["Từ số thứ nhất đến số thứ tư có mấy bước?", `${start + 1} → +2 → +2 → +2.`, `Cộng 2 ba lần vào ${start + 1}.`],
        `Ba bước cộng 2: ${start + 1} + 6 = ${start + 7}.`, "Chuyển giao sáng tạo",
        { wrong: { [start + 9]: "Bốn số thì chỉ có ba bước nhảy." } }),
      num(`Tạo theo luật: bắt đầu ${start + 1}, cộng lần lượt 2, 4, 6, 8. Số thứ năm là bao nhiêu?`, start + 21,
        ["Các bước cộng có bằng nhau không?", `${start + 1} → +2 → +4 → +6 → +8.`, `Cộng bốn phần tăng lại, rồi thêm vào ${start + 1}.`],
        `Tổng phần tăng là 20; ${start + 1} + 20 = ${start + 21}.`, "Chuyển giao sáng tạo",
        { steps: 2, wrong: { [start + 9]: "Con mới cộng bước cuối. Phải cộng cả 2, 4, 6 và 8." } }),
      num(`Tạo theo luật: bắt đầu ${start + 1}, cộng lần lượt 2, 4, 6, 8, 10. Số thứ sáu là bao nhiêu?`, start + 31,
        ["Từ số thứ nhất đến số thứ sáu có mấy lần cộng?", `${start + 1} → +2 → +4 → +6 → +8 → +10.`, `Cộng năm phần tăng lại, rồi thêm vào ${start + 1}.`],
        `Tổng phần tăng là 2 + 4 + 6 + 8 + 10 = 30; ${start + 1} + 30 = ${start + 31}.`, "Chuyển giao sáng tạo",
        { steps: 3, wrong: { [start + 21]: "Con mới cộng đến 8. Còn bước cộng 10 nữa.", [start + 11]: "Con mới cộng bước cuối. Phải cộng cả năm bước." } }),
    ),
  ];
}
