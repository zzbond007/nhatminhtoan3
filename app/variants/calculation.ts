// Miền "Chiến lược tính thông minh" — 6 chặng × 12 phiên bản × 3 dải.
import { byBand, mod, num, pick, type Band, type Q } from "./kit";

export function calculationQuestions(sequence: number, v: number, band: Band): Q[] {
  const easy = band === "support";

  if (sequence === 1) {
    // Số hạng thứ nhất luôn cách số tròn trăm từ 1 đến 5 đơn vị, nên phần chuyển sang luôn nhỏ hơn số hạng thứ hai.
    const move = 1 + mod(v, 5); const round = 100 * (byBand(band, 1, 3, 4) + mod(v, 4)); const base = round - move;
    const add = easy ? 12 + mod(v, 8) : 37 + mod(v, 20);
    const m = mod(v, 5); const k = mod(v, 3); const f = 6 + k;
    const right = `100 × ${f} − ${1 + k} × ${f}`;
    const small = 29 + 10 * mod(v, 3); const smallAdd = 5 + mod(v, 4);
    const big = 199 + 100 * Math.floor(v / 6); const third = 4 + mod(v, 6);
    return [
      num(`Tính nhẩm thuận tiện: ${base} + ${add}.`, base + add,
        [`Số ${base} còn thiếu bao nhiêu để thành số tròn trăm?`, `Chuyển ${move} từ ${add} sang ${base}: ${base} + ${move} = ${round}.`, `Tính ${round} + ${add - move}.`],
        `${base} + ${add} = ${round} + ${add - move} = ${base + add}.`, "Bù trừ",
        { steps: 2, wrong: { [round + add]: `Con đã làm tròn ${base} thành ${round} nhưng quên bớt lại ${move} ở số hạng kia.`, [base + add - 10]: "Con kiểm tra lại hàng chục: khi hàng đơn vị tròn 10 thì phải nhớ 1 chục." } }),
      num(`Tính nhanh: ${round + 3} − ${98 - m}.`, round + 3 - (98 - m),
        ["Số trừ gần với số tròn trăm nào?", `Cùng cộng ${2 + m} vào cả hai số: số trừ thành 100.`, `Tính ${round + 5 + m} − 100.`],
        `Cùng thêm ${2 + m} vào hai số thì hiệu không đổi: ${round + 5 + m} − 100 = ${round - 95 + m}.`, "Giữ hiệu",
        { steps: 2, wrong: { [round + 3 - 100]: `Con trừ 100, tức là đã trừ thừa ${2 + m}. Phải cộng trả lại phần trừ thừa.`, [round + 3 - 100 - (2 + m)]: `Trừ 100 là trừ THỪA ${2 + m}, nên phải cộng lại chứ không trừ tiếp.` } }),
      pick(`Biểu thức nào thuận tiện nhất để tính ${99 - k} × ${f}?`, right, [right, `${90 - k} + ${f}`, `${99 - k} + ${f}`, `100 × ${f} + ${f}`],
        [`Số ${99 - k} ít hơn 100 bao nhiêu?`, `${99 - k} = 100 − ${1 + k}, nên ${99 - k} × ${f} = (100 − ${1 + k}) × ${f}.`, "Nhân 100 trước, rồi bớt phần đã nhân thừa."],
        "Dùng số tròn trăm giúp tính nhẩm mà vẫn giữ đúng giá trị.", "Chọn chiến lược",
        { wrong: { [`${90 - k} + ${f}`]: "Biểu thức này là phép cộng với số khác hẳn; nó không bằng phép nhân đã cho.", [`${99 - k} + ${f}`]: "Đây là cộng hai số, không phải nhân.", [`100 × ${f} + ${f}`]: `Nhân 100 là đã nhân THỪA, nên phải bớt đi chứ không cộng thêm.` } }),
      num(`Điền số để tổng không đổi: ${base} + ${add} = ${round} + □.`, add - move,
        ["Số hạng thứ nhất đã tăng bao nhiêu?", `${base} tăng ${move} thành ${round}; số hạng kia phải giảm ${move}.`, `Tính ${add} − ${move}.`],
        `Chuyển ${move} giữa hai số hạng, ô trống là ${add - move}.`, "Giải thích biến đổi",
        { wrong: { [add + move]: "Số thứ nhất tăng thì số thứ hai phải GIẢM cùng lượng, nếu không tổng sẽ lớn lên.", [add]: `Nếu giữ nguyên ${add} thì vế phải lớn hơn vế trái ${move} đơn vị.` } }),
      byBand(band,
        num(`Tính nhẩm: ${small} + ${smallAdd}.`, small + smallAdd,
          [`Số ${small} còn thiếu bao nhiêu để tròn chục?`, `Chuyển 1 từ ${smallAdd} sang ${small}: ${small + 1} + ${smallAdd - 1}.`, "Cộng số tròn chục với phần còn lại."],
          `${small} + ${smallAdd} = ${small + 1} + ${smallAdd - 1} = ${small + smallAdd}.`, "Chuyển giao",
          { wrong: { [small + 1 + smallAdd]: "Con đã làm tròn số thứ nhất nhưng quên bớt 1 ở số thứ hai." } }),
        num(`Tính nhẩm và kiểm tra bằng cách khác: ${49 + v} + ${53 + v}.`, 102 + 2 * v,
          ["Mỗi số hơn hoặc kém 50 bao nhiêu?", `Lấy 50 làm mốc: xem ${49 + v} và ${53 + v} lệch khỏi 50 bao nhiêu.`, "Lấy 50 + 50 rồi cộng hai phần chênh."],
          `Tách 50 + 50 = 100; hai phần còn lại cộng thêm ${2 + 2 * v}.`, "Chuyển giao",
          { steps: 2, wrong: { [100 + 2 * v]: "Con kiểm tra lại phần chênh so với 50 của từng số.", [104 + 2 * v]: "Con kiểm tra lại: số thứ nhất kém hay hơn 50?" } }),
        num(`Tính nhẩm thuận tiện: ${big} + 298 + ${third}.`, big + 298 + third,
          ["Mỗi số gần tròn trăm còn thiếu bao nhiêu?", `${big} thiếu 1 và 298 thiếu 2: lấy 3 từ ${third} để bù cho hai số ấy.`, `Tính ${big + 1} + 300 + ${third - 3}.`],
          `${big} + 298 + ${third} = ${big + 1} + 300 + ${third - 3} = ${big + 298 + third}.`, "Chuyển giao",
          { steps: 3, wrong: { [big + 1 + 300 + third]: "Con đã làm tròn hai số nhưng quên bớt 3 ở số hạng thứ ba." } }),
      ),
    ];
  }

  if (sequence === 2) {
    const factor = easy ? 2 + mod(v, 3) : 4 + mod(v, 5); const tens = easy ? 10 + 10 * mod(v, 3) : 20 + 10 * mod(v, 4);
    const ones = easy ? 1 + mod(v, 4) : 2 + mod(v, 7); const value = tens + ones;
    const roundTo = easy ? 20 : 100; const less = easy ? 1 + mod(v, 2) : 1 + mod(v, 4); const near = roundTo - less;
    const correct = `${tens} × ${factor} + ${ones} × ${factor}`;
    const quarter = 25 + 5 * mod(v, 4);
    return [
      num(`Tính bằng cách tách: ${value} × ${factor}.`, value * factor,
        [`Số ${value} gồm mấy chục và mấy đơn vị?`, `${value} × ${factor} = ${tens} × ${factor} + ${ones} × ${factor}.`, `Tính ${tens * factor} + ${ones * factor}.`],
        `${value} × ${factor} = ${tens * factor} + ${ones * factor} = ${value * factor}.`, "Phân phối",
        { steps: 2, wrong: { [tens * factor + ones]: `Con quên nhân phần đơn vị ${ones} với ${factor}.`, [tens * factor]: `Con mới nhân phần chục. Còn ${ones} × ${factor} nữa.` } }),
      num(`Tính nhanh: ${near} × ${factor}.`, near * factor,
        [`Số ${near} ít hơn ${roundTo} bao nhiêu?`, `${near} × ${factor} = ${roundTo} × ${factor} − ${less} × ${factor}.`, `Tính ${roundTo * factor} − ${less * factor}.`],
        `${roundTo} × ${factor} − ${less} × ${factor} = ${near * factor}.`, "Số gần tròn",
        { steps: 2, wrong: { [roundTo * factor]: `Con mới nhân số tròn ${roundTo}. Còn phải bớt ${less} × ${factor}.`, [roundTo * factor - less]: `Phần bớt đi cũng phải nhân với ${factor}.` } }),
      pick(`Cách nào cho thấy rõ nhất vì sao ${value} × ${factor} đúng?`, correct, [correct, `${value} + ${factor}`, `${value} × ${factor - 1}`, `${tens + factor} × ${ones}`],
        ["Khi tách một số thành chục và đơn vị, mỗi phần cần làm gì?", `(${tens} + ${ones}) × ${factor}: cả ${tens} và ${ones} đều được nhân.`, "Chọn biểu thức nhân từng phần rồi cộng lại."],
        "Nhân từng phần rồi cộng lại thì giữ đúng giá trị của phép nhân.", "So sánh cách",
        { wrong: { [`${value} + ${factor}`]: "Đây là phép cộng, không phải phép nhân đã cho.", [`${value} × ${factor - 1}`]: `Nhân với ${factor - 1} thì thiếu một lần ${value}.`, [`${tens + factor} × ${ones}`]: "Biểu thức này trộn thừa số vào phần chục; nó không bằng phép nhân ban đầu." } }),
      pick(`Bạn Gấu tính ${value} × ${factor} bằng ${tens * factor} + ${ones}. Bạn ấy quên điều gì?`, `Quên nhân ${ones} với ${factor}`, [`Quên nhân ${ones} với ${factor}`, "Quên cộng hàng chục", "Quên viết đơn vị", "Không quên gì"],
        [`Phần đơn vị ${ones} đã được nhân chưa?`, `Đúng phải là ${tens} × ${factor} + ${ones} × ${factor}.`, "So từng phần trong bài của bạn Gấu với cách tách đúng."],
        `Bạn ấy quên nhân phần đơn vị ${ones} với ${factor}.`, "Phân tích lỗi",
        { wrong: { "Quên cộng hàng chục": `Phần chục ${tens} × ${factor} = ${tens * factor} đã có. Hãy xem phần đơn vị.`, "Quên viết đơn vị": "Bài không hỏi về đơn vị đo. Hãy xem từng phần đã được nhân chưa.", "Không quên gì": `Thử tính: ${tens * factor} + ${ones} có bằng ${value} × ${factor} không?` } }),
      byBand(band,
        num(`Điền số: ${value} × ${factor} = ${tens} × ${factor} + □.`, ones * factor,
          [`Sau khi nhân phần chục, còn phần nào của ${value} chưa được nhân?`, `${value} = ${tens} + ${ones}; phần còn lại là ${ones} × ${factor}.`, `Tính ${ones} nhân với ${factor}.`],
          `Ô trống là ${ones} × ${factor} = ${ones * factor}.`, "Chuyển giao",
          { wrong: { [ones]: `Phần đơn vị ${ones} cũng phải nhân với ${factor}.` } }),
        num(`Tính theo hai cách: ${quarter} × 4. Kết quả là bao nhiêu?`, quarter * 4,
          ["Con thấy cách nào nhanh: tách chục–đơn vị hay gấp đôi hai lần?", `Gấp đôi: ${quarter} → ${quarter * 2} → □. Hoặc tách: ${quarter - 5} × 4 + 5 × 4.`, "Làm cả hai cách và so hai kết quả."],
          `Gấp đôi hai lần: ${quarter} → ${quarter * 2} → ${quarter * 4}.`, "Chuyển giao nhiều cách",
          { steps: 2, wrong: { [quarter * 2]: "Con mới gấp đôi một lần. Nhân 4 là gấp đôi hai lần." } }),
        num(`Tính thuận tiện: ${value} × ${factor} + ${value} × ${10 - factor}.`, value * 10,
          [`Hai tích có chung thừa số nào?`, `Cả hai đều nhân với ${value}: gộp lại thành ${value} × (${factor} + ${10 - factor}).`, `Tính tổng trong ngoặc trước, rồi nhân với ${value}.`],
          `${value} × (${factor} + ${10 - factor}) = ${value} × 10 = ${value * 10}.`, "Chuyển giao nhiều cách",
          { steps: 3, wrong: { [value * factor]: "Con mới tính tích thứ nhất. Còn tích thứ hai nữa.", [value * 2 * 10]: `Thừa số chung ${value} chỉ lấy một lần khi gộp.` } }),
      ),
    ];
  }

  if (sequence === 3) {
    const x = easy ? 2 + mod(v, 5) : 5 + mod(v, 8); const mult = easy ? 2 + mod(v, 3) : 3 + mod(v, 5); const add = 2 + mod(v, 9);
    const out = x * mult + add; const check = `Tính ${x} × ${mult} + ${add}`;
    return [
      num(`Tìm số: □ × ${mult} + ${add} = ${out}.`, x,
        ["Thao tác nào được làm sau cùng?", `Tháo “+ ${add}” trước: ${out} − ${add} = ${out - add}.`, `Rồi tháo “× ${mult}”: lấy ${out - add} chia cho ${mult}.`],
        `${out} − ${add} = ${out - add}; ${out - add} : ${mult} = ${x}.`, "Đi ngược",
        { steps: 2, wrong: { [out - add]: `Con mới tháo “+ ${add}”. Còn phải tháo “× ${mult}”.`, [out * mult + add]: "Con đã làm xuôi. Muốn tìm số ban đầu thì phải đi ngược." } }),
      num(`Một máy cộng ${add} rồi nhân ${mult}. Đầu ra là ${(x + add) * mult}. Đầu vào là bao nhiêu?`, x,
        ["Máy làm thao tác nào sau cùng?", `Tháo “× ${mult}” trước: ${(x + add) * mult} : ${mult} = ${x + add}.`, `Rồi tháo “+ ${add}”: lấy ${x + add} trừ ${add}.`],
        `Đi ngược: ${(x + add) * mult} : ${mult} = ${x + add}; ${x + add} − ${add} = ${x}.`, "Thứ tự thao tác",
        { steps: 2, wrong: { [x + add]: `Con mới tháo phép nhân. Còn phải tháo “+ ${add}”.`, [(x + add) * mult - add]: "Máy nhân sau cùng, nên phải tháo phép nhân trước rồi mới tháo phép cộng." } }),
      num(`Tìm số chia: ${x * mult} : □ = ${mult}.`, x,
        ["Số chia nhân với thương thì được gì?", `□ × ${mult} = ${x * mult}.`, `Lấy ${x * mult} chia cho ${mult}.`],
        `${x * mult} : ${mult} = ${x}, nên số chia là ${x}.`, "Quan hệ ngược",
        { wrong: { [x * mult * mult]: "Con đã nhân. Số chia phải nhỏ hơn số bị chia.", [x * mult]: "Đây là số bị chia. Số chia là số nhân với thương để ra số bị chia." } }),
      pick(`Muốn kiểm tra đáp án ${x} cho □ × ${mult} + ${add} = ${out}, con nên làm gì?`, check, [check, `Tính ${x} + ${mult} + ${add}`, `Lấy ${out} + ${add}`, `Chỉ nhìn xem ${x} có chẵn không`],
        ["Thay số vừa tìm vào ô trống thì cần tính gì?", "Đi xuôi theo đúng hai thao tác của đề.", `Kết quả đi xuôi phải bằng ${out}.`],
        "Thay lại và đi xuôi là cách kiểm tra trực tiếp.", "Kiểm chứng",
        { wrong: { [`Tính ${x} + ${mult} + ${add}`]: "Đề dùng phép nhân rồi phép cộng, không phải cộng cả ba số.", [`Lấy ${out} + ${add}`]: "Phép tính này không dùng đến số vừa tìm được.", [`Chỉ nhìn xem ${x} có chẵn không`]: "Chẵn hay lẻ không cho biết đáp án có khớp đề hay không." } }),
      byBand(band,
        num(`Một số nhân ${mult} được ${x * mult}. Số đó là bao nhiêu?`, x,
          ["Phép tính nào tháo được phép nhân?", `□ × ${mult} = ${x * mult}.`, `Lấy ${x * mult} chia cho ${mult}.`],
          `${x * mult} : ${mult} = ${x}.`, "Chuyển giao",
          { wrong: { [x * mult * mult]: "Con đã nhân thêm. Muốn tháo phép nhân thì dùng phép chia.", [x * mult - mult]: "Tháo phép nhân bằng phép chia, không phải phép trừ." } }),
        num(`Máy lấy số vào, nhân ${mult + 1}, trừ ${add}. Đầu ra là ${x * (mult + 1) - add}. Số vào là bao nhiêu?`, x,
          ["Thao tác cuối cùng của máy là gì?", `Tháo “− ${add}” trước: ${x * (mult + 1) - add} + ${add} = ${x * (mult + 1)}.`, `Rồi lấy ${x * (mult + 1)} chia cho ${mult + 1}.`],
          `Cộng lại ${add} được ${x * (mult + 1)}; chia ${mult + 1} được ${x}.`, "Chuyển giao máy mới",
          { steps: 2, wrong: { [x * (mult + 1)]: `Con mới tháo phép trừ. Còn phải chia cho ${mult + 1}.` } }),
        num(`Máy lấy số vào, cộng 2, nhân ${mult}, rồi trừ ${add}. Đầu ra là ${(x + 2) * mult - add}. Số vào là bao nhiêu?`, x,
          ["Máy có mấy thao tác, và thao tác nào làm sau cùng?", `Đi ngược: cộng lại ${add}, rồi chia ${mult}, rồi trừ 2.`, `${(x + 2) * mult - add} + ${add} = ${(x + 2) * mult}; tiếp tục chia cho ${mult} rồi bớt 2.`],
          `Cộng ${add} được ${(x + 2) * mult}; chia ${mult} được ${x + 2}; trừ 2 được ${x}.`, "Chuyển giao máy mới",
          { steps: 3, wrong: { [x + 2]: "Con còn một thao tác chưa tháo: máy đã cộng 2 ngay từ đầu.", [(x + 2) * mult]: "Con mới tháo phép trừ. Còn hai thao tác nữa." } }),
      ),
    ];
  }

  if (sequence === 4) {
    const a = easy ? 45 + 3 * v : 245 + 7 * v; const b = easy ? 18 + mod(v, 6) : 48 + mod(v, 11); const shift = 1 + mod(v, 5);
    const same = `${a + shift} − ${b + shift}`; const c = 30 + mod(v, 7);
    return [
      num(`Điền số: ${a} + ${b} = ${a - shift} + □.`, b + shift,
        ["Số hạng thứ nhất đã giảm bao nhiêu?", `${a} giảm ${shift} thành ${a - shift}; số hạng kia phải tăng ${shift}.`, `Tính ${b} + ${shift}.`],
        `Giữ tổng không đổi nên ô trống là ${b} + ${shift} = ${b + shift}.`, "Giữ tổng",
        { wrong: { [b - shift]: "Số thứ nhất đã giảm, nên số thứ hai phải TĂNG để bù lại.", [b]: `Nếu giữ nguyên ${b} thì vế phải nhỏ hơn vế trái ${shift} đơn vị.` } }),
      pick(`Biểu thức nào bằng ${a} − ${b}?`, same, [same, `${a + shift} − ${b}`, `${a} − ${b + shift}`, `${a - shift} − ${b + shift}`],
        ["Muốn giữ hiệu, hai số phải thay đổi cùng chiều hay ngược chiều?", `Cùng cộng ${shift} vào số bị trừ và số trừ thì khoảng cách không đổi.`, "Tìm biểu thức mà cả hai số cùng tăng một lượng như nhau."],
        "Cùng tăng số bị trừ và số trừ một lượng như nhau thì hiệu không đổi.", "Giữ hiệu",
        { wrong: { [`${a + shift} − ${b}`]: `Chỉ số bị trừ tăng, nên hiệu lớn thêm ${shift}.`, [`${a} − ${b + shift}`]: `Chỉ số trừ tăng, nên hiệu nhỏ đi ${shift}.`, [`${a - shift} − ${b + shift}`]: `Một số giảm, một số tăng: hiệu nhỏ đi ${2 * shift}.` } }),
      pick(`Đúng hay sai: ${a} + ${b} = ${a + 10} + ${b - 10}.`, "Đúng", ["Đúng", "Sai", "Chỉ đúng khi tổng chẵn"],
        ["Một số tăng 10 và số kia giảm 10 thì tổng thay đổi thế nào?", "Phần thay đổi: + 10 rồi − 10.", "Hai phần thay đổi bù nhau."],
        "Chuyển 10 từ số hạng này sang số hạng kia không làm đổi tổng.", "Lập luận cân bằng",
        { wrong: { "Sai": "Thử cộng phần thay đổi: thêm 10 rồi bớt 10 thì còn lại bao nhiêu?", "Chỉ đúng khi tổng chẵn": "Chẵn hay lẻ không ảnh hưởng: thêm 10 và bớt 10 luôn bù nhau." } }),
      pick(`Bạn Mèo đổi ${a} − ${b} thành ${a + shift} − ${b - shift}. Hiệu có giữ nguyên không?`, "Không", ["Có", "Không", "Chỉ khi số chẵn"],
        ["Hai số đã thay đổi cùng chiều hay ngược chiều?", `Số bị trừ tăng ${shift}, số trừ giảm ${shift}: khoảng cách giữa hai số giãn ra.`, "Khoảng cách giãn ra thì hiệu có còn như cũ không?"],
        `Cách đổi làm hiệu tăng ${2 * shift}, nên không giữ nguyên.`, "Phát hiện biến đổi sai",
        { wrong: { "Có": "Với hiệu, hai số phải thay đổi CÙNG chiều. Ở đây một số tăng, một số giảm.", "Chỉ khi số chẵn": "Chẵn hay lẻ không liên quan. Hãy xem hai số đổi cùng chiều hay ngược chiều." } }),
      byBand(band,
        num(`Điền số: ${a} + ${b} = ${a + 1} + □.`, b - 1,
          ["Số hạng thứ nhất đã tăng bao nhiêu?", `${a} tăng 1 thành ${a + 1}; số hạng kia phải giảm 1.`, `Tính ${b} − 1.`],
          `Chuyển 1 đơn vị: ô trống là ${b - 1}.`, "Chuyển giao",
          { wrong: { [b + 1]: "Số thứ nhất tăng thì số thứ hai phải GIẢM." } }),
        num(`Điền số để hai vế bằng nhau: ${a + 20} − ${b + 20} = ${a} − □.`, b,
          ["Ở vế trái, hai số đã cùng tăng bao nhiêu so với vế phải?", `${a + 20} hơn ${a} đúng 20, nên số trừ ở vế trái cũng hơn ô trống 20.`, `Tính ${b + 20} − 20.`],
          `Cùng bớt 20 ở hai số thì hiệu không đổi: ô trống là ${b}.`, "Chuyển giao",
          { steps: 2, wrong: { [b + 20]: "Số bị trừ đã bớt 20, nên số trừ cũng phải bớt 20.", [b + 40]: "Hai số phải thay đổi cùng chiều: cùng bớt 20." } }),
        num(`Điền số: ${a} + ${b} + ${c} = ${a + shift} + ${b + shift} + □.`, c - 2 * shift,
          ["Hai số hạng đầu đã tăng tất cả bao nhiêu?", `Mỗi số tăng ${shift}, hai số tăng ${2 * shift}; số hạng thứ ba phải giảm ${2 * shift}.`, `Tính ${c} − ${2 * shift}.`],
          `Hai số đầu tăng ${2 * shift}, nên ô trống là ${c} − ${2 * shift} = ${c - 2 * shift}.`, "Chuyển giao",
          { steps: 3, wrong: { [c - shift]: `Cả hai số hạng đầu đều tăng ${shift}, nên phải bớt ${2 * shift}.`, [c + 2 * shift]: "Hai số đầu tăng thì số thứ ba phải GIẢM." } }),
      ),
    ];
  }

  if (sequence === 5) {
    // Mỗi số hạng lệch khỏi số tròn trăm dưới 25 đơn vị và tổng hai độ lệch dưới 10,
    // nên làm tròn từng số hay tính chính xác đều dẫn về cùng một mốc trăm.
    const near = mod(v, 6);
    const a = (easy ? 100 + 100 * mod(v, 2) : 300 + 100 * mod(v, 3)) + [12, -9, 18, -14, 7, -21][near];
    const b = (easy ? 100 + 100 * Math.floor(v / 6) : 200 + 100 * Math.floor(v / 6) + 100 * mod(v + 1, 2)) + [-8, 15, -11, 9, -16, 13][near];
    const exact = a + b; const ra = Math.round(a / 100) * 100; const rb = Math.round(b / 100) * 100; const rounded = ra + rb;
    const nearFifty = [48, 49, 52, 51][mod(v, 4)]; const times = 5 + mod(v, 4); const product = 50 * times;
    const low = Math.floor(exact / 100) * 100; const range = `${low} đến ${low + 100}`;
    const c = 99 + 100 * mod(v, 2);
    return [
      pick(`${a} + ${b} gần số nào nhất?`, rounded, easy ? [rounded - 100, rounded, rounded + 100, rounded + 200] : [rounded - 200, rounded - 100, rounded, rounded + 100],
        ["Mỗi số hạng gần với số tròn trăm nào nhất?", `${a} gần ${ra}; ${b} gần ${rb}.`, "Cộng hai số tròn trăm vừa tìm."],
        `Ước lượng ${ra} + ${rb} = ${rounded}; kết quả chính xác là ${exact}.`, "Ước lượng tổng",
        { steps: 2, wrong: { [rounded - 100]: `Con kiểm tra lại: ${a} và ${b}, mỗi số gần trăm nào hơn?`, [rounded + 100]: `Con kiểm tra lại: ${a} và ${b}, mỗi số gần trăm nào hơn?`, [rounded - 200]: "Con đã làm tròn xuống cả hai số quá nhiều. Hãy xem chữ số hàng chục của từng số.", [rounded + 200]: "Con đã làm tròn lên cả hai số quá nhiều. Hãy xem chữ số hàng chục của từng số." } }),
      pick(`${nearFifty} × ${times} gần số nào nhất?`, product, [product - 100, product - 50, product, product + 50],
        [`Số ${nearFifty} gần với số tròn chục nào?`, `Thay ${nearFifty} bằng 50: tính 50 × ${times}.`, "Chọn số bằng với tích gần đúng vừa tính."],
        `50 × ${times} = ${product}; tích chính xác là ${nearFifty * times}, gần ${product} nhất.`, "Ước lượng tích",
        { steps: 2, wrong: { [product - 50]: `Thử tính 50 × ${times}: tích gần đúng là bao nhiêu?`, [product + 50]: `Thử tính 50 × ${times}: tích gần đúng là bao nhiêu?`, [product - 100]: `Số này quá nhỏ: ${times} lần của một số gần 50 phải gần 50 × ${times}.` } }),
      pick(`Một bạn tính ${a} + ${b} = ${exact - 100}. Kết quả này có hợp lý không?`, "Không", ["Có", "Không", "Không thể kiểm tra"],
        ["Ước lượng theo hàng trăm thì tổng gần số nào?", `${ra} + ${rb} = ${rounded}.`, `So ${exact - 100} với ước lượng: lệch nhiều hay ít?`],
        `Ước lượng cho thấy ${exact - 100} quá thấp; tổng đúng là ${exact}.`, "Bắt lỗi",
        { steps: 2, wrong: { "Có": `Tổng phải gần ${rounded}. Kết quả của bạn ấy lệch khoảng 100.`, "Không thể kiểm tra": "Kiểm tra được bằng ước lượng: làm tròn từng số đến hàng trăm rồi cộng." } }),
      pick(`Khoảng nào chắc chắn chứa tổng ${a} + ${b}?`, range, [`${low - 100} đến ${low}`, range, `${low + 100} đến ${low + 200}`],
        ["Tổng gần với số tròn trăm nào?", `Tổng gần ${rounded}; hãy xem nó nhỏ hơn hay lớn hơn ${rounded} một chút.`, `Cộng hàng chục và đơn vị của hai số để biết tổng nằm trước hay sau ${rounded}.`],
        `${exact} nằm trong khoảng ${range}.`, "Khoảng hợp lý",
        { steps: 2, wrong: { [`${low - 100} đến ${low}`]: `Tổng gần ${rounded}. Khoảng này nằm thấp quá.`, [`${low + 100} đến ${low + 200}`]: `Tổng gần ${rounded}. Khoảng này nằm cao quá.` } }),
      byBand(band,
        num(`Làm tròn ${a} đến hàng trăm thì được số nào?`, ra,
          [`Số ${a} nằm giữa hai số tròn trăm nào?`, `${a} nằm giữa ${Math.floor(a / 100) * 100} và ${Math.floor(a / 100) * 100 + 100}.`, "Xem chữ số hàng chục: dưới 5 thì về trăm bé, từ 5 trở lên thì về trăm lớn."],
          `${a} gần ${ra} hơn.`, "Chuyển giao",
          { wrong: { [ra === Math.floor(a / 100) * 100 ? ra + 100 : ra - 100]: `Con xem lại chữ số hàng chục của ${a}.` } }),
        num(`Ước lượng rồi tính: ${a - 100} + ${b + 50}. Kết quả chính xác là bao nhiêu?`, exact - 50,
          [`So với ${a} + ${b} = ${exact}, tổng mới tăng hay giảm?`, "Một số giảm 100, số kia tăng 50: tổng giảm 50.", `Tính ${exact} − 50.`],
          `Tổng mới là ${exact} − 50 = ${exact - 50}.`, "Chuyển giao",
          { steps: 2, wrong: { [exact + 50]: "Giảm 100 rồi tăng 50 thì tổng GIẢM 50.", [exact - 150]: "Số thứ hai tăng 50 chứ không giảm." } }),
        num(`Ước lượng rồi tính chính xác: ${a} + ${b} − ${c}.`, exact - c,
          [`Số trừ ${c} gần với số tròn trăm nào?`, `${a} + ${b} = ${exact}. Trừ ${c + 1} rồi cộng trả lại 1.`, `Tính ${exact} − ${c + 1}, sau đó thêm 1.`],
          `${exact} − ${c + 1} = ${exact - c - 1}; thêm 1 được ${exact - c}.`, "Chuyển giao",
          { steps: 3, wrong: { [exact - c - 1]: `Con trừ ${c + 1} nhưng quên cộng trả lại 1.`, [exact - c - 2]: "Trừ thừa 1 thì phải cộng trả lại 1, không trừ tiếp." } }),
      ),
    ];
  }

  const target = easy ? 20 + 10 * mod(v, 4) : 60 + 10 * mod(v, 7); const factor = easy ? 2 + mod(v, 3) : 4 + mod(v, 6);
  const x = Math.floor((target - 2) / factor); const adjusted = x * factor + 2; const tenth = target / 10; const k = 2 + mod(v, 3);
  return [
    pick(`Biểu thức nào bằng ${target}?`, `${tenth} × 10`, [`${tenth} × 10`, `${target - 10} + 5`, `${target + 20} − 10`, `${tenth} + 10`],
      ["Mỗi biểu thức cho kết quả bao nhiêu?", `${target - 10} + 5 = ${target - 5}; ${target + 20} − 10 = ${target + 10}.`, "Tính hai biểu thức còn lại và so với đích."],
      `${tenth} × 10 = ${target}.`, "Phép tính đích",
      { wrong: { [`${target - 10} + 5`]: `${target - 10} + 5 = ${target - 5}, còn thiếu 5.`, [`${target + 20} − 10`]: `${target + 20} − 10 = ${target + 10}, thừa 10.`, [`${tenth} + 10`]: `${tenth} + 10 = ${tenth + 10}. Phép cộng này khác phép nhân với 10.` } }),
    num(`Điền số: ${factor} × □ + 2 = ${adjusted}.`, x,
      ["Thao tác nào được làm sau cùng?", `Tháo “+ 2” trước: ${adjusted} − 2 = ${adjusted - 2}.`, `Lấy ${adjusted - 2} chia cho ${factor}.`],
      `${adjusted} − 2 = ${adjusted - 2}; ${adjusted - 2} : ${factor} = ${x}.`, "Tạo biểu thức",
      { steps: 2, wrong: { [adjusted - 2]: `Con mới tháo “+ 2”. Còn phải chia cho ${factor}.`, [adjusted * factor + 2]: "Con đã làm xuôi. Hãy đi ngược từ kết quả." } }),
    num(`Có bao nhiêu biểu thức bằng ${target}: ${target - 20} + 20; ${target + 25} − 25; ${tenth} × 10; ${target / 2} × 3?`, 3,
      ["Có biểu thức nào KHÔNG quay về đích không?", `Thêm rồi bớt cùng một số thì quay về đích. Còn ${target / 2} × 3 thì sao?`, `${target / 2} × 2 mới bằng ${target}; nhân 3 thì lớn hơn.`],
      `Ba biểu thức đầu bằng ${target}; ${target / 2} × 3 = ${(target / 2) * 3} thì không.`, "Nhiều cách",
      { steps: 2, wrong: { 4: `Con tính lại biểu thức cuối: ${target / 2} × 3 có bằng ${target} không?`, 2: "Con kiểm tra lại: thêm rồi bớt cùng một số thì kết quả có đổi không?" } }),
    pick(`Đổi đúng một dấu để ${target / 2} + 2 = ${target} trở thành một phép tính đúng.`, "Đổi + thành ×", ["Đổi + thành ×", "Đổi = thành +", "Đổi + thành −", "Không thể"],
      [`Số ${target} gấp mấy lần số ${target / 2}?`, `${target} là gấp đôi của ${target / 2}.`, "Phép tính nào với 2 tạo ra gấp đôi?"],
      `${target / 2} × 2 = ${target}.`, "Biến đổi dấu",
      { wrong: { "Đổi = thành +": "Bỏ dấu bằng thì không còn là một phép tính có kết quả.", "Đổi + thành −": `${target / 2} − 2 nhỏ hơn ${target / 2}, càng xa đích.`, "Không thể": `Thử nghĩ: ${target} gấp mấy lần ${target / 2}?` } }),
    byBand(band,
      num(`Điền số: □ × 10 = ${target}.`, tenth,
        ["Số nào nhân 10 thì thêm một chữ số 0 ở cuối?", `${target} : 10 = □.`, `Bỏ chữ số 0 ở cuối số ${target}.`],
        `${tenth} × 10 = ${target}.`, "Chuyển giao sáng tạo",
        { wrong: { [target * 10]: "Con đã nhân thêm 10. Ô trống phải nhỏ hơn đích." } }),
      num(`Tạo đích ${target + 20}: điền □ vào (${tenth} + □) × 10 = ${target + 20}.`, 2,
        ["Trong ngoặc phải bằng bao nhiêu để nhân 10 ra đích?", `${target + 20} : 10 = ${tenth + 2}.`, `${tenth} + □ = ${tenth + 2}.`],
        `Trong ngoặc cần ${tenth + 2}, nên ô trống là 2.`, "Chuyển giao sáng tạo",
        { steps: 2, wrong: { 20: "Số trong ô còn được nhân 10 nữa. Thêm 20 vào ngoặc sẽ thành thêm 200." } }),
      num(`Tạo đích ${target + 10 * k - 5}: điền □ vào (${tenth} + □) × 10 − 5 = ${target + 10 * k - 5}.`, k,
        ["Thao tác nào được làm sau cùng trong biểu thức?", `Tháo “− 5”: ${target + 10 * k - 5} + 5 = ${target + 10 * k}. Rồi chia 10 được ${tenth + k}.`, `${tenth} + □ = ${tenth + k}.`],
        `Cộng lại 5 được ${target + 10 * k}; chia 10 được ${tenth + k}; ô trống là ${k}.`, "Chuyển giao sáng tạo",
        { steps: 3, wrong: { [10 * k]: "Số trong ô còn được nhân 10 nữa.", [tenth + k]: `Đây là giá trị của cả ngoặc. Ô trống là phần thêm vào ${tenth}.` } }),
    ),
  ];
}
