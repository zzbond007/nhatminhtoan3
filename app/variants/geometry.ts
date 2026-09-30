// Miền "Hình học khám phá" — 6 chặng × 12 phiên bản × 3 dải.
import { byBand, mod, num, pick, type Band, type Q } from "./kit";

/** Các cặp cạnh nguyên (bé, lớn) có tích bằng `area`, từ hình dài nhất đến hình gọn nhất. */
function factorPairs(area: number) {
  return Array.from({ length: Math.floor(Math.sqrt(area)) }, (_, index) => index + 1).filter((side) => area % side === 0).map((side) => [side, area / side]);
}

export function geometryQuestions(sequence: number, v: number, band: Band): Q[] {
  const easy = band === "support";
  const shift = band === "stretch" ? 2 : 0;

  if (sequence === 1) {
    const area = (easy ? [6, 8, 10, 12, 15, 16] : [12, 18, 20, 24, 30, 36])[mod(v + shift, 6)];
    const pairs = factorPairs(area); const thin = pairs[0]; const best = pairs.at(-1)!;
    const thinName = `${thin[0]}×${thin[1]}`; const bestName = `${best[0]}×${best[1]}`;
    const thinPerimeter = 2 * (thin[0] + thin[1]); const bestPerimeter = 2 * (best[0] + best[1]);
    const row = 3 + mod(v, 5);
    return [
      num(`Dùng ${area} ô vuông đơn vị xếp hình chữ nhật ${thinName}. Chu vi hình đó là bao nhiêu?`, thinPerimeter,
        ["Chu vi đo phần bên trong hay đường bao quanh hình?", `Đi quanh hình: ${thin[1]} + ${thin[0]} + ${thin[1]} + ${thin[0]}.`, `Tính (${thin[0]} + ${thin[1]}) × 2.`],
        `(${thin[0]} + ${thin[1]}) × 2 = ${thinPerimeter}.`, "Chu vi",
        { steps: 2, wrong: { [area]: "Đây là diện tích (số ô bên trong). Chu vi là độ dài đường bao quanh.", [thin[0] + thin[1]]: "Con mới cộng một chiều dài và một chiều rộng. Đường bao có hai chiều dài và hai chiều rộng." } }),
      num(`Hình ${bestName} và hình ${thinName} cùng có diện tích bao nhiêu ô vuông?`, area,
        ["Diện tích đếm cái gì?", `Hình ${bestName} có ${best[0]} hàng, mỗi hàng ${best[1]} ô.`, `Tính ${best[0]} × ${best[1]}.`],
        `Cùng dùng ${area} ô nên cùng diện tích ${area}.`, "Diện tích không đổi",
        { wrong: { [best[0] + best[1]]: "Con cộng hai cạnh. Diện tích là số hàng nhân số ô mỗi hàng.", [thinPerimeter]: "Đây là chu vi của hình dài. Diện tích là số ô bên trong." } }),
      pick(`Trong các hình có diện tích ${area}, hình nào có chu vi nhỏ hơn?`, bestName, [thinName, bestName, "Bằng nhau"],
        ["Cùng diện tích thì chu vi có bắt buộc bằng nhau không?", `Chu vi ${thinName} là ${thinPerimeter}.`, "Tính chu vi hình còn lại rồi so sánh."],
        `${bestName} có chu vi ${bestPerimeter}, nhỏ hơn ${thinPerimeter}.`, "So sánh",
        { steps: 2, wrong: { [thinName]: `Hình dài có chu vi ${thinPerimeter}. Tính thử chu vi hình kia.`, "Bằng nhau": "Cùng diện tích chưa chắc cùng chu vi: ô xếp sát nhau thì nhiều cạnh nằm bên trong hơn." } }),
      pick(`Đổi hình ${thinName} thành ${bestName} bằng cách xếp lại các ô, diện tích có đổi không?`, "Không", ["Có", "Không", "Chỉ đổi khi thành hình vuông"],
        ["Khi xếp lại, có ô nào bị thêm vào hay bỏ đi không?", `Trước và sau đều có ${area} ô.`, "Diện tích bằng số ô; số ô có thay đổi không?"],
        "Sắp xếp lại không làm đổi tổng số ô, nên diện tích giữ nguyên.", "Bảo toàn",
        { wrong: { "Có": "Hình dáng và chu vi đổi, nhưng số ô vẫn như cũ.", "Chỉ đổi khi thành hình vuông": "Dù xếp thành hình gì, số ô vẫn không đổi." } }),
      byBand(band,
        num(`Một hình chữ nhật có 2 hàng, mỗi hàng ${row} ô vuông. Diện tích là bao nhiêu ô?`, 2 * row,
          ["Có mấy hàng và mỗi hàng mấy ô?", `${row} + ${row}.`, `Tính 2 × ${row}.`],
          `2 × ${row} = ${2 * row} ô.`, "Chuyển giao",
          { wrong: { [2 + row]: "Diện tích là số hàng NHÂN số ô mỗi hàng.", [2 * (2 + row)]: "Đây là chu vi. Diện tích là số ô bên trong." } }),
        num(`Một hình chữ nhật diện tích ${area} ô có một cạnh ${best[0]}. Chu vi hình đó là bao nhiêu?`, bestPerimeter,
          ["Muốn tính chu vi, con còn thiếu cạnh nào?", `Cạnh kia: ${area} : ${best[0]} = ${best[1]}.`, `Tính (${best[0]} + ${best[1]}) × 2.`],
          `Cạnh kia ${best[1]}; chu vi (${best[0]} + ${best[1]}) × 2 = ${bestPerimeter}.`, "Chuyển giao",
          { steps: 2, wrong: { [best[1]]: "Đây là cạnh kia. Câu hỏi là chu vi.", [2 * (best[0] + area)]: "Diện tích không phải là cạnh. Hãy tìm cạnh kia bằng phép chia." } }),
        num(`Hai hình chữ nhật cùng diện tích ${area} ô: một hình có cạnh 1, hình kia có cạnh ${best[0]}. Chu vi hai hình chênh nhau bao nhiêu?`, thinPerimeter - bestPerimeter,
          ["Mỗi hình có cạnh còn lại dài bao nhiêu?", `Hình thứ nhất ${thinName}: chu vi ${thinPerimeter}. Hình thứ hai ${bestName}.`, `Tính chu vi hình ${bestName} rồi lấy ${thinPerimeter} trừ đi.`],
          `Chu vi ${thinPerimeter} và ${bestPerimeter}; chênh ${thinPerimeter - bestPerimeter}.`, "Chuyển giao",
          { steps: 3, wrong: { 0: "Cùng diện tích nhưng chu vi khác nhau. Hãy tính từng chu vi.", [thinPerimeter]: "Đây là chu vi của hình dài. Còn phải trừ chu vi hình kia." } }),
      ),
    ];
  }

  if (sequence === 2) {
    const total = easy ? 8 + v : 16 + 2 * v; const part = easy ? 3 + mod(v, 4) : 5 + mod(v, total - 8);
    const r = 2 + mod(v, 3); const c = 4 + mod(v, 4); const bigR = 4 + 2 * mod(v, 3); const bigC = 5 + mod(v, 4); const even = 2 * (4 + v);
    return [
      num(`Một hình diện tích ${total} ô được cắt thành hai mảnh. Một mảnh ${part} ô. Mảnh kia có bao nhiêu ô?`, total - part,
        ["Sau khi cắt, tổng diện tích hai mảnh so với hình ban đầu thế nào?", `${part} + □ = ${total}.`, `Tính ${total} − ${part}.`],
        `${total} − ${part} = ${total - part} ô.`, "Bảo toàn diện tích",
        { wrong: { [total + part]: "Cắt ra thì mỗi mảnh nhỏ hơn hình ban đầu: dùng phép trừ.", [total]: "Đây là cả hình. Mảnh kia là phần còn lại sau khi bỏ mảnh đã biết." } }),
      num(`Hai mảnh ${part} ô và ${total - part} ô ghép không chồng lên nhau. Hình mới có diện tích bao nhiêu ô?`, total,
        ["Ghép không chồng thì có ô nào bị che mất không?", `${part} ô và ${total - part} ô nằm cạnh nhau.`, `Tính ${part} + ${total - part}.`],
        `${part} + ${total - part} = ${total} ô.`, "Cắt ghép",
        { wrong: { [part * (total - part)]: "Ghép hai mảnh là CỘNG diện tích, không nhân.", [part]: "Đây mới là một mảnh. Hình mới gồm cả hai mảnh." } }),
      pick("Khi cắt một hình rồi ghép lại không chồng, đại lượng nào chắc chắn giữ nguyên?", "Diện tích", ["Diện tích", "Chu vi", "Số cạnh", "Chiều dài"],
        ["Cắt ghép có làm mất hay thêm phần nào của hình không?", "Cạnh tiếp xúc giữa hai mảnh thì nằm bên trong, không còn là đường bao.", "Đại lượng nào chỉ phụ thuộc vào phần phủ kín?"],
        "Diện tích được bảo toàn; chu vi và hình dáng có thể đổi.", "Điều không đổi",
        { wrong: { "Chu vi": "Chu vi có thể đổi: cạnh ghép vào nhau thì không còn là đường bao.", "Số cạnh": "Hình mới có thể có nhiều hay ít cạnh hơn hình cũ.", "Chiều dài": "Hình mới có thể dài hơn hoặc ngắn hơn tùy cách ghép." } }),
      num(`Ghép hai hình chữ nhật ${r}×${c} không chồng nhau. Tổng diện tích là bao nhiêu ô?`, 2 * r * c,
        ["Một hình có diện tích bao nhiêu ô?", `Một hình: ${r} × ${c} = ${r * c} ô.`, `Hai hình bằng nhau: tính ${r * c} + ${r * c}.`],
        `Mỗi hình ${r * c} ô; hai hình ${2 * r * c} ô.`, "Ghép phần",
        { steps: 2, wrong: { [r * c]: "Đây mới là diện tích một hình. Có hai hình.", [2 * (r + c)]: "Đây là chu vi một hình. Câu hỏi là diện tích." } }),
      byBand(band,
        num(`Một hình diện tích ${even} ô được cắt thành hai phần bằng nhau. Mỗi phần có bao nhiêu ô?`, even / 2,
          ["Hai phần bằng nhau thì mỗi phần bằng bao nhiêu của cả hình?", `□ + □ = ${even}.`, `Tính ${even} : 2.`],
          `${even} : 2 = ${even / 2} ô.`, "Chuyển giao",
          { wrong: { [even * 2]: "Cắt đôi thì mỗi phần NHỎ hơn cả hình: dùng phép chia." } }),
        num(`Một hình chữ nhật ${bigR}×${bigC} được cắt đôi thành hai phần bằng nhau. Mỗi phần có diện tích bao nhiêu ô?`, (bigR * bigC) / 2,
          ["Cả hình có diện tích bao nhiêu ô?", `Cả hình: ${bigR} × ${bigC} = ${bigR * bigC} ô.`, `Tính ${bigR * bigC} : 2.`],
          `Cả hình ${bigR * bigC} ô; mỗi phần ${(bigR * bigC) / 2} ô.`, "Chuyển giao",
          { steps: 2, wrong: { [bigR * bigC]: "Đây là cả hình. Mỗi phần chỉ bằng một nửa." } }),
        num(`Một hình chữ nhật ${bigR}×${bigC} bị cắt bỏ một góc hình vuông 2×2. Phần còn lại chia đều thành 2 mảnh. Mỗi mảnh có bao nhiêu ô?`, (bigR * bigC - 4) / 2,
          ["Sau khi cắt góc, còn lại bao nhiêu ô?", `Cả hình ${bigR * bigC} ô; góc bị cắt có 2 × 2 = 4 ô; còn ${bigR * bigC - 4} ô.`, `Tính ${bigR * bigC - 4} : 2.`],
          `Còn ${bigR * bigC - 4} ô; mỗi mảnh ${(bigR * bigC - 4) / 2} ô.`, "Chuyển giao",
          { steps: 3, wrong: { [(bigR * bigC) / 2]: "Con quên trừ 4 ô của góc bị cắt.", [(bigR * bigC - 2) / 2]: "Góc hình vuông 2×2 có 4 ô, không phải 2 ô." } }),
      ),
    ];
  }

  if (sequence === 3) {
    const rows = easy ? 2 : 2 + mod(v, 3); const cols = easy ? 2 + mod(v, 3) : 3 + mod(v + 1, 4);
    const across = (cols * (cols + 1)) / 2; const down = (rows * (rows + 1)) / 2; const rectangles = across * down;
    const squares = Array.from({ length: Math.min(rows, cols) }, (_, index) => (rows - index) * (cols - index)).reduce((sum, value) => sum + value, 0);
    const system = "Chia theo kích thước rồi theo vị trí";
    return [
      num(`Lưới 1×${cols} (một hàng ${cols} ô) có bao nhiêu hình chữ nhật tất cả?`, across,
        ["Ngoài các ô đơn, còn hình nào được ghép từ nhiều ô liền nhau?", `Dài 1 ô: ${cols} hình. Dài 2 ô: ${cols - 1} hình. Cứ thế đến dài ${cols} ô: 1 hình.`, `Cộng ${Array.from({ length: cols }, (_, index) => cols - index).join(" + ")}.`],
        `Cộng theo độ dài: ${Array.from({ length: cols }, (_, index) => cols - index).join(" + ")} = ${across}.`, "Đếm theo kích thước",
        { steps: 2, wrong: { [cols]: "Con mới đếm các ô đơn. Hai ô liền nhau cũng tạo thành một hình chữ nhật.", [cols + 1]: "Con mới đếm ô đơn và cả hàng. Còn các hình dài 2 ô, 3 ô, …" } }),
      num(`Lưới ${rows}×${cols} có bao nhiêu ô vuông 1×1?`, rows * cols,
        ["Lưới có mấy hàng và mỗi hàng mấy ô?", `${rows} hàng, mỗi hàng ${cols} ô.`, `Tính ${rows} × ${cols}.`],
        `${rows} × ${cols} = ${rows * cols} ô.`, "Theo vị trí",
        { wrong: { [rows + cols]: "Số ô là số hàng NHÂN số ô mỗi hàng.", [cols]: "Đây mới là số ô của một hàng." } }),
      num(`Lưới ${rows}×${cols} có tất cả bao nhiêu hình vuông mọi cỡ?`, squares,
        ["Ngoài ô 1×1, lưới còn hình vuông cỡ nào nữa?", `${Array.from({ length: Math.min(rows, cols) }, (_, index) => `Cỡ ${index + 1}×${index + 1}: ${(rows - index) * (cols - index)} hình.`).join(" ")}`, "Cộng số hình của các cỡ."],
        `Cộng theo cỡ được ${squares} hình vuông.`, "Nhiều cỡ",
        { steps: 2, wrong: { [rows * cols]: "Con mới đếm ô 1×1. Bốn ô ghép thành hình vuông 2×2 cũng tính.", [rows * cols + 1]: "Hình vuông 2×2 có thể nằm ở nhiều vị trí. Hãy đếm từng vị trí." } }),
      pick(`Cách nào giúp đếm hình trong lưới ${rows}×${cols} không bị trùng?`, system, ["Nhìn và đếm thật nhanh", system, "Chỉ đếm hình nhỏ", "Đếm lại nhiều lần ngẫu nhiên"],
        ["Làm sao biết một hình đã được đếm rồi hay chưa?", "Xếp các hình vào từng nhóm: cỡ 1×1, cỡ 1×2, …", "Trong mỗi nhóm, quét lần lượt từ trái sang phải, từ trên xuống dưới."],
        "Chia theo cỡ rồi quét theo vị trí tạo danh sách đầy đủ, không lặp.", "Chiến lược hệ thống",
        { wrong: { "Nhìn và đếm thật nhanh": "Đếm nhanh dễ sót hình lớn hoặc đếm trùng.", "Chỉ đếm hình nhỏ": "Như vậy sẽ bỏ sót mọi hình ghép từ nhiều ô.", "Đếm lại nhiều lần ngẫu nhiên": "Đếm lại mà không có thứ tự thì vẫn có thể sót cùng một hình." } }),
      byBand(band,
        num(`Lưới 1×${cols + 2} (một hàng ${cols + 2} ô) có bao nhiêu hình chữ nhật gồm đúng 2 ô liền nhau?`, cols + 1,
          ["Hình 2 ô đầu tiên nằm ở đâu, hình cuối cùng nằm ở đâu?", "Hình 2 ô có thể bắt đầu từ ô thứ nhất, ô thứ hai, … nhưng không bắt đầu từ ô cuối.", `Đếm số ô có thể làm ô bắt đầu trong ${cols + 2} ô.`],
          `Có ${cols + 1} vị trí bắt đầu, nên có ${cols + 1} hình.`, "Chuyển giao",
          { wrong: { [cols + 2]: "Ô cuối cùng không thể là ô bắt đầu của một hình 2 ô.", [(cols + 2) / 2]: "Các hình 2 ô được phép chồng lấn nhau: ô 1–2, ô 2–3, …" } }),
        num(`Thử thách: lưới ${rows}×${cols} có tất cả bao nhiêu hình chữ nhật?`, rectangles,
          ["Mỗi hình chữ nhật được xác định bởi bề ngang và chiều cao nào?", `Có ${across} cách chọn bề ngang (như lưới 1×${cols}) và ${down} cách chọn chiều cao.`, "Nhân số cách chọn bề ngang với số cách chọn chiều cao."],
          `${across} cách chọn bề ngang × ${down} cách chọn chiều cao = ${rectangles} hình.`, "Chuyển giao mở rộng",
          { steps: 2, wrong: { [rows * cols]: "Con mới đếm các ô 1×1.", [squares]: "Đây là số hình vuông. Hình chữ nhật còn gồm cả các hình không vuông." } }),
        num(`Lưới ${rows}×${cols} có bao nhiêu hình chữ nhật KHÔNG phải hình vuông?`, rectangles - squares,
          ["Trong các hình chữ nhật của lưới, những hình nào cần loại ra?", `Tất cả có ${across} × ${down} = ${rectangles} hình chữ nhật. Đếm hình vuông theo từng cỡ.`, "Lấy số hình chữ nhật trừ số hình vuông."],
          `Có ${rectangles} hình chữ nhật, trong đó ${squares} hình vuông; còn ${rectangles - squares}.`, "Chuyển giao mở rộng",
          { steps: 3, wrong: { [rectangles]: "Đây là tất cả hình chữ nhật, kể cả hình vuông. Phải loại hình vuông.", [rectangles - rows * cols]: "Con mới loại các ô 1×1. Hình vuông cỡ lớn hơn cũng phải loại." } }),
      ),
    ];
  }

  if (sequence === 4) {
    const turn = 90 * (1 + mod(v, 3)); const holes = 1 + mod(v, 3);
    const letters: [string, number][] = [["A", 1], ["H", 2], ["M", 1], ["T", 1], ["X", 2], ["U", 1]];
    const [letter, axes] = letters[mod(v, letters.length)];
    return [
      num("Hình vuông có bao nhiêu trục đối xứng?", 4,
        ["Gấp hình vuông theo những đường nào thì hai nửa trùng khít?", "Thử gấp ngang, gấp dọc, rồi gấp theo từng đường chéo.", "Đếm các nếp gấp làm hai nửa trùng khít."],
        "Hình vuông có 4 trục: ngang, dọc và hai đường chéo.", "Đối xứng",
        { wrong: { 2: "Con mới đếm nếp gấp ngang và dọc. Hai đường chéo cũng làm hai nửa trùng khít.", 1: "Thử gấp theo nhiều hướng khác nhau." } }),
      pick(`Xoay hình vuông ${turn}° quanh tâm, hình có trùng khít vị trí cũ không?`, "Có", ["Có", "Không", "Chỉ khi xoay 360°"],
        ["Bốn cạnh và bốn góc của hình vuông có giống nhau không?", "Mỗi lần xoay 90° là một phần tư vòng: cạnh này chồng lên chỗ của cạnh kia.", `${turn}° gồm mấy lần xoay 90°?`],
        "Hình vuông trùng khít sau mỗi lần xoay 90°.", "Phép xoay",
        { wrong: { "Không": "Các đỉnh đổi chỗ cho nhau, nhưng đường bao vẫn nằm đúng chỗ cũ.", "Chỉ khi xoay 360°": "Không cần xoay hết vòng: mỗi phần tư vòng hình vuông đã trùng khít." } }),
      num("Hình chữ nhật không phải hình vuông có bao nhiêu trục đối xứng?", 2,
        ["Gấp theo đường chéo thì hai nửa hình chữ nhật có trùng khít không?", "Thử với tờ giấy: gấp ngang, gấp dọc, gấp chéo.", "Chỉ đếm nếp gấp làm hai nửa trùng khít."],
        "Hình chữ nhật có trục ngang và trục dọc; đường chéo thì không.", "Phân loại",
        { wrong: { 4: "Gấp hình chữ nhật theo đường chéo thì hai nửa lệch nhau, nên đường chéo không phải trục đối xứng.", 1: "Cả nếp gấp ngang và nếp gấp dọc đều làm hai nửa trùng khít." } }),
      num(`Gấp đôi tờ giấy rồi đục ${holes} lỗ xuyên qua hai lớp (không lỗ nào nằm trên nếp gấp). Mở ra thấy bao nhiêu lỗ?`, 2 * holes,
        ["Mỗi lần đục, mũi đục đi qua mấy lớp giấy?", "Mỗi lỗ xuyên qua 2 lớp, nên khi mở ra có một lỗ và một lỗ đối xứng với nó.", `Tính ${holes} × 2.`],
        `Mỗi lỗ thành 2 lỗ đối xứng: ${holes} × 2 = ${2 * holes}.`, "Gấp giấy",
        { wrong: { [holes]: "Giấy đang gấp đôi, nên mỗi lần đục tạo ra lỗ trên cả hai lớp.", [holes + 2]: "Mỗi lỗ đều được nhân đôi, không phải cộng thêm 2." } }),
      byBand(band,
        num(`Chữ ${letter} in hoa có mấy trục đối xứng?`, axes,
          ["Gấp chữ theo đường nào thì hai nửa trùng khít?", "Thử nếp gấp dọc ở giữa chữ, rồi thử nếp gấp ngang.", "Đếm các nếp gấp làm hai nửa trùng khít."],
          `Chữ ${letter} có ${axes} trục đối xứng.`, "Chuyển giao",
          { wrong: { [axes === 1 ? 2 : 1]: "Con thử lại từng nếp gấp: dọc ở giữa và ngang ở giữa.", 0: "Thử gấp dọc ở chính giữa chữ." } }),
        num(`Gấp tờ giấy làm tư (gấp đôi hai lần) rồi đục ${holes} lỗ xuyên qua tất cả các lớp (không lỗ nào nằm trên nếp gấp). Mở ra thấy bao nhiêu lỗ?`, 4 * holes,
          ["Gấp đôi hai lần thì tờ giấy có mấy lớp?", "Gấp đôi lần một: 2 lớp. Gấp đôi lần hai: 4 lớp.", `Mỗi lỗ xuyên qua 4 lớp: tính ${holes} × 4.`],
          `Có 4 lớp giấy, nên ${holes} × 4 = ${4 * holes} lỗ.`, "Chuyển giao",
          { steps: 2, wrong: { [2 * holes]: "Gấp đôi HAI lần tạo ra 4 lớp, không phải 2 lớp.", [holes + 4]: "Mỗi lỗ đều xuất hiện trên cả 4 lớp." } }),
        num(`Gấp đôi tờ giấy ba lần liên tiếp rồi đục ${holes} lỗ xuyên qua tất cả các lớp (không lỗ nào nằm trên nếp gấp). Mở ra thấy bao nhiêu lỗ?`, 8 * holes,
          ["Mỗi lần gấp đôi, số lớp giấy thay đổi thế nào?", "Số lớp: 2 → 4 → 8.", `Mỗi lỗ xuyên qua 8 lớp: tính ${holes} × 8.`],
          `Ba lần gấp đôi tạo 8 lớp, nên ${holes} × 8 = ${8 * holes} lỗ.`, "Chuyển giao",
          { steps: 3, wrong: { [6 * holes]: "Mỗi lần gấp là GẤP ĐÔI số lớp: 2, 4, 8 chứ không phải 2, 4, 6.", [4 * holes]: "Đây là khi gấp đôi hai lần. Ở đây gấp ba lần." } }),
      ),
    ];
  }

  if (sequence === 5) {
    const r = easy ? 2 + 2 * mod(v, 3) : 4 + 2 * mod(v, 4); const c = easy ? 4 + 2 * mod(v + 1, 2) : 6 + 2 * mod(v + 1, 4); const tile = 2 + mod(v, 2);
    const fits = r % tile === 0 && c % tile === 0; const rowLength = c + tile; const rowFits = rowLength % tile === 0;
    return [
      num(`Một bảng ${r}×${c} ô cần bao nhiêu viên gạch 1×1 để lát kín?`, r * c,
        ["Lát kín nghĩa là mỗi ô cần mấy viên gạch 1×1?", `${r} hàng, mỗi hàng ${c} viên.`, `Tính ${r} × ${c}.`],
        `${r} × ${c} = ${r * c} viên.`, "Lát kín",
        { wrong: { [r + c]: "Số viên là số hàng NHÂN số viên mỗi hàng.", [r]: `Đây mới là số hàng. Mỗi hàng cần ${c} viên.` } }),
      pick(`Gạch ${tile}×${tile} (không cắt) có lát kín bảng ${r}×${c} không?`, fits ? "Có" : "Không", ["Có", "Không", "Không thể biết"],
        [`Mỗi chiều của bảng có chia hết cho ${tile} không?`, `${r} : ${tile} và ${c} : ${tile}: phép chia nào còn dư?`, "Chỉ lát kín được khi cả hai chiều đều xếp vừa khít."],
        `${r} và ${c} ${fits ? "đều" : "không cùng"} chia hết cho ${tile}.`, "Điều kiện lát",
        { steps: 2, wrong: { [fits ? "Không" : "Có"]: `Con kiểm tra lại từng chiều: ${r} và ${c} có chia hết cho ${tile} không?`, "Không thể biết": "Biết được: chỉ cần xem mỗi chiều của bảng có chia hết cho cạnh viên gạch không." } }),
      num(`Bảng ${r}×${c} lát bằng gạch 2×2 cần bao nhiêu viên?`, (r * c) / 4,
        ["Một viên gạch 2×2 phủ được mấy ô?", `Bảng có ${r * c} ô; mỗi viên phủ 4 ô.`, `Tính ${r * c} : 4.`],
        `${r * c} : 4 = ${(r * c) / 4} viên.`, "Phủ theo khối",
        { steps: 2, wrong: { [(r * c) / 2]: "Viên gạch 2×2 phủ 4 ô, không phải 2 ô.", [r * c]: "Đây là số viên 1×1. Viên 2×2 to gấp bốn nên cần ít viên hơn." } }),
      pick("Vì sao các hình tròn bằng nhau không lát kín mặt phẳng nếu không chồng lên nhau?", "Giữa các hình còn khe hở", ["Giữa các hình còn khe hở", "Hình tròn không có diện tích", "Hình tròn quá nhỏ", "Vì có quá nhiều màu"],
        ["Đặt bốn đồng xu sát nhau thì ở giữa có gì?", "Cạnh cong chỉ chạm nhau tại một điểm.", "Phần không được phủ giữa các hình gọi là gì?"],
        "Các hình tròn tiếp xúc vẫn để lại khe ở giữa.", "Giải thích hình học",
        { wrong: { "Hình tròn không có diện tích": "Hình tròn có diện tích: nó phủ được một phần mặt bàn.", "Hình tròn quá nhỏ": "To hay nhỏ không quan trọng; hình vuông nhỏ vẫn lát kín được.", "Vì có quá nhiều màu": "Màu sắc không ảnh hưởng đến việc lát kín." } }),
      byBand(band,
        num(`Gạch 1×2 lát kín một hàng dài ${c} ô thì cần bao nhiêu viên?`, c / 2,
          ["Mỗi viên gạch 1×2 phủ mấy ô?", `${c} ô, mỗi viên phủ 2 ô.`, `Tính ${c} : 2.`],
          `${c} : 2 = ${c / 2} viên.`, "Chuyển giao",
          { wrong: { [c * 2]: "Mỗi viên phủ 2 ô nên số viên ÍT hơn số ô." } }),
        pick(`Gạch 1×${tile} (không cắt) có lát kín một hàng dài ${rowLength} ô không?`, rowFits ? "Có" : "Không", ["Có", "Không", "Chỉ khi xếp chéo"],
          [`${rowLength} có chia hết cho ${tile} không?`, `Xếp lần lượt: mỗi viên phủ ${tile} ô.`, `Tính ${rowLength} : ${tile} xem có dư không.`],
          `${rowLength} ${rowFits ? "chia hết" : "không chia hết"} cho ${tile}.`, "Chuyển giao",
          { steps: 2, wrong: { [rowFits ? "Không" : "Có"]: `Con thử chia ${rowLength} cho ${tile}.`, "Chỉ khi xếp chéo": "Hàng chỉ rộng 1 ô nên không xếp chéo được." } }),
        pick(`Bảng ${r}×${c} bị bỏ đi một ô ở góc. Gạch 1×2 (không cắt) có lát kín phần còn lại không?`, "Không", ["Có", "Không", "Không thể biết"],
          ["Phần còn lại có bao nhiêu ô, và mỗi viên gạch phủ mấy ô?", `Còn ${r * c} − 1 = ${r * c - 1} ô. Mỗi viên phủ đúng 2 ô.`, "Số ô còn lại là chẵn hay lẻ? Các viên 2 ô có phủ vừa hết một số lẻ ô không?"],
          `Còn ${r * c - 1} ô là số lẻ; mỗi viên phủ 2 ô nên luôn thừa ra 1 ô.`, "Chuyển giao",
          { steps: 3, wrong: { "Có": `Thử đếm: ${r * c - 1} ô có chia được thành các cặp 2 ô không?`, "Không thể biết": "Biết được nhờ chẵn–lẻ: số ô còn lại là số lẻ." } }),
      ),
    ];
  }

  const area = (easy ? [12, 16, 18, 20, 24, 28] : [24, 30, 36, 40, 48, 60])[mod(v + shift, 6)];
  const pairs = factorPairs(area); const best = pairs.at(-1)!; const worst = pairs[0];
  const bestName = `${best[0]}×${best[1]}`; const worstName = `${worst[0]}×${worst[1]}`;
  const bestPerimeter = 2 * (best[0] + best[1]); const worstPerimeter = 2 * (worst[0] + worst[1]);
  const pairAnswer = `${best[1]} và ${bestPerimeter}`;
  const pairOptions = [pairAnswer, `${best[1]} và ${area}`, `${area} và ${best[1]}`, `${best[1]} và ${best[0] + best[1]}`, `${best[0]} và ${area}`].filter((value, index, all) => all.indexOf(value) === index).slice(0, 4);
  return [
    pick(`Với ${area} ô, hình nào có chu vi nhỏ nhất?`, bestName, [worstName, bestName, "Mọi hình bằng nhau"],
      ["Những cặp cạnh nào nhân với nhau được số ô đã cho?", `Các cặp: ${pairs.map((pair) => `${pair[0]}×${pair[1]}`).join(", ")}.`, "Tính chu vi của từng cặp rồi so sánh."],
      `${bestName} có chu vi ${bestPerimeter}, nhỏ nhất.`, "Tối ưu chu vi",
      { steps: 2, wrong: { [worstName]: `Hình dài có chu vi ${worstPerimeter}. Thử tính chu vi hình gọn hơn.`, "Mọi hình bằng nhau": "Cùng diện tích nhưng chu vi khác nhau. Hãy tính thử hai hình." } }),
    num(`Hình ${worstName} có chu vi bao nhiêu?`, worstPerimeter,
      ["Đường bao quanh hình gồm những cạnh nào?", `Hai cạnh ${worst[0]} và hai cạnh ${worst[1]}.`, `Tính (${worst[0]} + ${worst[1]}) × 2.`],
      `(${worst[0]} + ${worst[1]}) × 2 = ${worstPerimeter}.`, "Tính chuẩn",
      { wrong: { [area]: "Đây là diện tích. Chu vi là độ dài đường bao quanh.", [worst[0] + worst[1]]: "Con mới cộng hai cạnh. Đường bao có bốn cạnh." } }),
    pick(`Hai hình ${worstName} và ${bestName} cùng diện tích ${area}. Hình nào gọn hơn theo chu vi?`, bestName, [worstName, bestName, "Bằng nhau"],
      ["“Gọn hơn theo chu vi” nghĩa là chu vi lớn hơn hay nhỏ hơn?", `Chu vi ${worstName} là ${worstPerimeter}.`, "Tính chu vi hình còn lại rồi so sánh."],
      `${bestName} dùng ít đường viền hơn: ${bestPerimeter} so với ${worstPerimeter}.`, "Tiêu chí tối ưu",
      { steps: 2, wrong: { [worstName]: `Hình này có chu vi ${worstPerimeter}, lớn hơn hình kia.`, "Bằng nhau": "Cùng diện tích chưa chắc cùng chu vi." } }),
    pick("Muốn chứng minh một hình là tối ưu trong các hình cạnh nguyên, ta cần làm gì?", "Xét mọi cặp thừa số có thể", ["Chỉ nhìn bằng mắt", "Xét mọi cặp thừa số có thể", "Thử một hình vuông", "Đoán cạnh dài nhất"],
      ["Làm sao biết không còn hình nào tốt hơn?", "Mỗi hình chữ nhật ứng với một cặp số có tích bằng diện tích.", "Khi đã so sánh hết các cặp thì mới kết luận được."],
      "Xét mọi cặp thừa số giúp kết luận không bỏ sót.", "Chứng minh tối ưu",
      { wrong: { "Chỉ nhìn bằng mắt": "Nhìn bằng mắt có thể sai. Cần con số để so sánh.", "Thử một hình vuông": "Không phải diện tích nào cũng xếp được thành hình vuông.", "Đoán cạnh dài nhất": "Đoán chưa phải bằng chứng. Hãy liệt kê và so sánh." } }),
    byBand(band,
      num(`Hình chữ nhật ${bestName} có chu vi bao nhiêu?`, bestPerimeter,
        ["Đường bao quanh hình gồm những cạnh nào?", `Hai cạnh ${best[0]} và hai cạnh ${best[1]}.`, `Tính (${best[0]} + ${best[1]}) × 2.`],
        `(${best[0]} + ${best[1]}) × 2 = ${bestPerimeter}.`, "Chuyển giao",
        { wrong: { [area]: "Đây là diện tích. Chu vi là độ dài đường bao quanh.", [best[0] + best[1]]: "Con mới cộng hai cạnh. Đường bao có bốn cạnh." } }),
      pick(`Một hình chữ nhật diện tích ${area} có cạnh ${best[0]}. Cạnh kia và chu vi lần lượt là gì?`, pairAnswer, pairOptions,
        ["Tìm cạnh kia bằng phép tính nào?", `Cạnh kia: ${area} : ${best[0]} = ${best[1]}.`, "Cộng hai cạnh rồi nhân 2 để có chu vi."],
        `Cạnh kia ${best[1]}, chu vi ${bestPerimeter}.`, "Chuyển giao",
        { steps: 2, wrong: Object.fromEntries(pairOptions.filter((option) => option !== pairAnswer).map((option) => [option, option.endsWith(` ${area}`) || option.startsWith(`${area} `) ? "Diện tích không phải là chu vi hay cạnh. Chu vi là (cạnh + cạnh) × 2." : "Con mới cộng hai cạnh. Chu vi còn phải nhân 2."])) }),
      num(`Trong các hình chữ nhật cạnh nguyên có diện tích ${area}, chu vi lớn nhất hơn chu vi nhỏ nhất bao nhiêu?`, worstPerimeter - bestPerimeter,
        ["Hình nào có chu vi lớn nhất, hình nào nhỏ nhất?", `Dài nhất là ${worstName} (chu vi ${worstPerimeter}); gọn nhất là ${bestName}.`, `Tính chu vi ${bestName} rồi lấy ${worstPerimeter} trừ đi.`],
        `${worstPerimeter} − ${bestPerimeter} = ${worstPerimeter - bestPerimeter}.`, "Chuyển giao",
        { steps: 3, wrong: { [worstPerimeter]: "Đây là chu vi lớn nhất. Còn phải trừ chu vi nhỏ nhất.", 0: "Các hình cùng diện tích có chu vi khác nhau." } }),
    ),
  ];
}
