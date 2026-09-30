// Miền "Dữ liệu và khả năng" — 6 chặng × 12 phiên bản × 3 dải.
import { byBand, mod, num, pick, type Band, type Q } from "./kit";

export function dataQuestions(sequence: number, v: number, band: Band): Q[] {
  const easy = band === "support";
  const allValues = [4 + mod(v, 4), 7 + mod(v + 1, 5), 5 + mod(v + 2, 6), 9 + mod(v + 3, 5)];

  if (sequence === 1) {
    const values = easy ? allValues.slice(0, 3) : allValues;
    const total = values.reduce((sum, value) => sum + value, 0); const max = Math.max(...values); const min = Math.min(...values);
    const list = values.join(", "); const fifth = 6 + mod(v, 5); const goal = 45;
    const fact = `Giá trị lớn nhất là ${max}`;
    return [
      num(`Bảng ghi số sách đọc trong ${values.length} tuần: ${list}. Tổng số sách là bao nhiêu?`, total,
        ["Cần cộng số sách của mấy tuần?", `${values.join(" + ")}.`, "Cộng lần lượt từ trái sang phải, đánh dấu số đã cộng."],
        `${values.join(" + ")} = ${total} cuốn.`, "Đọc dữ liệu",
        { steps: 2, wrong: { [total - values.at(-1)!]: "Con cộng thiếu tuần cuối cùng.", [max]: "Đây là tuần đọc nhiều nhất. Câu hỏi là tổng của tất cả các tuần." } }),
      num(`Từ dữ liệu ${list}, tuần cao nhất hơn tuần thấp nhất bao nhiêu cuốn?`, max - min,
        ["Số nào lớn nhất và số nào nhỏ nhất trong bảng?", `Lớn nhất là ${max}, nhỏ nhất là ${min}.`, `Tính ${max} − ${min}.`],
        `${max} − ${min} = ${max - min} cuốn.`, "So sánh dữ liệu",
        { steps: 2, wrong: { [max + min]: "“Hơn bao nhiêu” là phần chênh lệch: dùng phép trừ.", [max]: "Đây là giá trị lớn nhất. Còn phải trừ giá trị nhỏ nhất." } }),
      pick("Bảng chỉ ghi số sách đã đọc. Có thể kết luận tuần đọc nhiều sách nhất cũng là tuần đọc lâu nhất không?", "Không", ["Có", "Không", "Luôn luôn đúng"],
        ["Bảng có ghi thời gian đọc không?", "Bảng chỉ có số cuốn sách. Một cuốn có thể dày, có thể mỏng.", "Không có số liệu về thời gian thì kết luận về thời gian có chắc không?"],
        "Dữ liệu chưa đủ để kết luận về thời gian đọc.", "Giới hạn kết luận",
        { wrong: { "Có": "Nhiều cuốn mỏng có thể đọc nhanh hơn một cuốn dày. Bảng không ghi thời gian.", "Luôn luôn đúng": "Số sách và thời gian đọc là hai dữ liệu khác nhau." } }),
      pick("Kết luận nào chỉ dựa đúng vào bảng số liệu?", fact, [fact, "Tuần đó vui nhất", "Mọi cuốn sách dài bằng nhau", "Người đọc thích tuần cuối"],
        ["Kết luận nào kiểm tra được bằng chính các con số trong bảng?", `Các số trong bảng: ${list}.`, "Loại những câu nói về cảm xúc hoặc điều bảng không ghi."],
        `Chỉ kết luận “${fact.toLocaleLowerCase("vi")}” được số liệu chứng minh.`, "Bằng chứng",
        { wrong: { "Tuần đó vui nhất": "Bảng không ghi cảm xúc, nên không kiểm tra được.", "Mọi cuốn sách dài bằng nhau": "Bảng không ghi số trang của từng cuốn.", "Người đọc thích tuần cuối": "Bảng không ghi sở thích của người đọc." } }),
      byBand(band,
        num(`Từ dữ liệu ${list}, tuần đọc nhiều nhất đọc bao nhiêu cuốn?`, max,
          ["Cần tìm số lớn nhất hay số nhỏ nhất?", "So từng số với số đang lớn nhất.", "Giữ lại số lớn nhất sau khi so hết."],
          `${max} là giá trị lớn nhất.`, "Chuyển giao",
          { wrong: { [min]: "Đây là tuần đọc ít nhất.", [total]: "Đây là tổng của các tuần. Câu hỏi chỉ hỏi một tuần." } }),
        num(`Bảng ghi số sách bốn tuần: ${allValues.join(", ")}. Thêm tuần thứ năm đọc ${fifth} cuốn. Tổng năm tuần là bao nhiêu?`, allValues.reduce((sum, value) => sum + value, 0) + fifth,
          ["Tổng bốn tuần đầu là bao nhiêu?", `${allValues.join(" + ")} = ${allValues.reduce((sum, value) => sum + value, 0)}.`, `Cộng thêm ${fifth} vào tổng bốn tuần.`],
          `Bốn tuần ${allValues.reduce((sum, value) => sum + value, 0)} cuốn; thêm ${fifth} là ${allValues.reduce((sum, value) => sum + value, 0) + fifth} cuốn.`, "Chuyển giao",
          { steps: 2, wrong: { [allValues.reduce((sum, value) => sum + value, 0)]: "Đây là tổng bốn tuần. Còn tuần thứ năm." } }),
        num(`Bảng ghi số sách bốn tuần: ${allValues.join(", ")}. Muốn tổng năm tuần đạt ${goal} cuốn thì tuần thứ năm cần đọc bao nhiêu cuốn?`, goal - allValues.reduce((sum, value) => sum + value, 0),
          ["Bốn tuần đầu đã đọc tất cả bao nhiêu cuốn?", `${allValues.join(" + ")} = ${allValues.reduce((sum, value) => sum + value, 0)}.`, `Lấy ${goal} trừ tổng bốn tuần.`],
          `Đã đọc ${allValues.reduce((sum, value) => sum + value, 0)} cuốn; còn cần ${goal} − ${allValues.reduce((sum, value) => sum + value, 0)} = ${goal - allValues.reduce((sum, value) => sum + value, 0)} cuốn.`, "Chuyển giao",
          { steps: 3, wrong: { [goal]: "Đây là mục tiêu của cả năm tuần. Phải trừ phần đã đọc.", [allValues.reduce((sum, value) => sum + value, 0)]: "Đây là số đã đọc. Câu hỏi là số còn cần đọc." } }),
      ),
    ];
  }

  if (sequence === 2) {
    const tops = 2 + mod(v, 3); const bottoms = easy ? 2 + mod(v + 1, 2) : 3 + mod(v + 1, 4); const combos = tops * bottoms;
    const roads = tops + 1; const system = "Cố định lựa chọn thứ nhất rồi quét hết lựa chọn thứ hai";
    return [
      num(`Có ${tops} áo và ${bottoms} quần khác nhau. Có bao nhiêu bộ gồm 1 áo và 1 quần?`, combos,
        ["Một chiếc áo ghép được với mấy chiếc quần?", `Áo thứ nhất: ${bottoms} bộ. Áo thứ hai: ${bottoms} bộ. …`, `Tính ${tops} × ${bottoms}.`],
        `Mỗi áo ghép với ${bottoms} quần: ${tops} × ${bottoms} = ${combos} bộ.`, "Cây khả năng",
        { wrong: { [tops + bottoms]: "Mỗi áo ghép được với MỌI quần, nên nhân chứ không cộng.", [bottoms]: "Đây mới là số bộ của một chiếc áo." } }),
      num(`Có ${roads} đường từ nhà đến trạm A và ${bottoms} đường từ A đến trường. Có bao nhiêu lộ trình từ nhà đến trường?`, roads * bottoms,
        ["Chọn xong đường thứ nhất, còn mấy cách chọn đường thứ hai?", `Vẽ cây: ${roads} nhánh đầu, mỗi nhánh chia ${bottoms} nhánh con.`, `Tính ${roads} × ${bottoms}.`],
        `${roads} × ${bottoms} = ${roads * bottoms} lộ trình.`, "Quy tắc nhân",
        { wrong: { [roads + bottoms]: "Mỗi đường đoạn đầu ghép với mọi đường đoạn sau: nhân chứ không cộng." } }),
      num(`Tủ có ${tops} áo và ${bottoms} quần. Nếu thêm 1 chiếc áo thì số bộ tăng thêm bao nhiêu?`, bottoms,
        ["Chiếc áo mới ghép được với mấy chiếc quần?", `Áo mới đi với từng chiếc trong ${bottoms} quần.`, "Mỗi cách ghép của áo mới là một bộ mới."],
        `Áo mới tạo thêm ${bottoms} bộ.`, "Thay đổi dữ liệu",
        { steps: 2, wrong: { 1: "Thêm một áo không phải thêm một bộ: áo đó ghép được với mọi quần.", [combos + bottoms]: "Đây là tổng số bộ sau khi thêm. Câu hỏi là số bộ TĂNG THÊM." } }),
      pick("Cách nào giúp liệt kê không trùng, không sót?", system, ["Liệt kê theo trí nhớ", system, "Chọn ngẫu nhiên", "Chỉ đếm kết quả đẹp"],
        ["Làm sao biết một cách ghép đã được viết ra rồi?", "Giữ nguyên áo thứ nhất, lần lượt đổi quần. Xong mới sang áo thứ hai.", "Cách nào tạo ra một trật tự lặp lại như vậy?"],
        "Quét có hệ thống tránh bỏ sót và tránh lặp.", "Chiến lược liệt kê",
        { wrong: { "Liệt kê theo trí nhớ": "Nhớ đến đâu viết đến đó thì dễ sót hoặc viết trùng.", "Chọn ngẫu nhiên": "Chọn ngẫu nhiên không cho biết khi nào đã đủ.", "Chỉ đếm kết quả đẹp": "Mọi cách ghép đều phải được đếm, đẹp hay không cũng vậy." } }),
      byBand(band,
        num(`Có 2 loại bánh và ${bottoms + 1} loại nước. Chọn 1 bánh và 1 nước thì có bao nhiêu cách?`, 2 * (bottoms + 1),
          ["Một loại bánh ghép được với mấy loại nước?", `Bánh thứ nhất: ${bottoms + 1} cách. Bánh thứ hai: ${bottoms + 1} cách.`, `Tính 2 × ${bottoms + 1}.`],
          `2 × ${bottoms + 1} = ${2 * (bottoms + 1)} cách.`, "Chuyển giao",
          { wrong: { [bottoms + 3]: "Mỗi loại bánh ghép với MỌI loại nước: nhân chứ không cộng." } }),
        num(`Có ${tops} món chính, ${bottoms} món phụ và 2 đồ uống. Có bao nhiêu suất chọn mỗi loại một món?`, combos * 2,
          ["Cây khả năng này có mấy tầng?", `Hai tầng đầu có ${tops} × ${bottoms} = ${combos} cách. Mỗi cách lại chia 2 nhánh đồ uống.`, `Tính ${combos} × 2.`],
          `${tops} × ${bottoms} × 2 = ${combos * 2} suất.`, "Chuyển giao ba tầng",
          { steps: 2, wrong: { [combos]: "Con mới ghép món chính với món phụ. Còn đồ uống.", [tops + bottoms + 2]: "Mỗi lựa chọn ghép với mọi lựa chọn ở tầng sau: nhân chứ không cộng." } }),
        num(`Có ${tops} áo, ${bottoms} quần và 2 chiếc mũ. Mỗi bộ gồm 1 áo, 1 quần, và có thể đội một trong hai mũ hoặc không đội mũ. Có bao nhiêu bộ?`, combos * 3,
          ["Về chuyện mũ, có tất cả mấy lựa chọn?", `Mũ: mũ thứ nhất, mũ thứ hai, hoặc không đội — 3 lựa chọn. Áo và quần: ${combos} cách.`, `Tính ${combos} × 3.`],
          `${tops} × ${bottoms} = ${combos}; ba lựa chọn về mũ: ${combos} × 3 = ${combos * 3} bộ.`, "Chuyển giao ba tầng",
          { steps: 3, wrong: { [combos * 2]: "“Không đội mũ” cũng là một lựa chọn: có 3 lựa chọn về mũ.", [combos]: "Con mới ghép áo với quần. Còn lựa chọn về mũ." } }),
      ),
    ];
  }

  if (sequence === 3) {
    const red = 3 + mod(v, 3); const same = 3 + mod(v, 4); const gap = 2 + mod(v, 3);
    const fair = "Tung đồng xu: một bạn chọn sấp, một bạn chọn ngửa";
    return [
      pick(`Túi A có ${red} thẻ đỏ, 1 thẻ xanh. Túi B có 2 thẻ đỏ, 2 thẻ xanh. Muốn dễ rút được thẻ xanh hơn thì nên chọn túi nào?`, "Túi B", ["Túi A", "Túi B", "Hai túi như nhau"],
        ["Trong mỗi túi, thẻ xanh chiếm nhiều hay ít so với cả túi?", `Túi B: 2 trong 4 thẻ là xanh, tức một nửa. Túi A: 1 trong ${red + 1} thẻ.`, "Ở túi A, thẻ xanh có được một nửa không?"],
        "Túi B có một nửa là thẻ xanh, nhiều hơn phần thẻ xanh của túi A.", "So khả năng",
        { steps: 2, wrong: { "Túi A": "Túi A nhiều thẻ hơn, nhưng hầu hết là thẻ đỏ.", "Hai túi như nhau": "Hãy so phần thẻ xanh trong mỗi túi, không chỉ đếm số thẻ xanh." } }),
      pick("Một vòng quay có 4 phần bằng nhau: 2 phần đỏ, 1 phần xanh, 1 phần vàng. Màu nào dễ trúng nhất?", "Đỏ", ["Đỏ", "Xanh", "Vàng", "Như nhau"],
        ["Các phần bằng nhau, vậy màu nào chiếm nhiều phần nhất?", "Đỏ: 2 phần. Xanh: 1 phần. Vàng: 1 phần.", "Màu chiếm nhiều phần hơn thì kim dễ dừng ở đó hơn."],
        "Đỏ chiếm 2 trên 4 phần nên dễ trúng nhất.", "Mô hình công bằng",
        { wrong: { "Xanh": "Xanh chỉ có 1 phần, ít hơn đỏ.", "Vàng": "Vàng chỉ có 1 phần, ít hơn đỏ.", "Như nhau": "Ba màu không chiếm số phần bằng nhau." } }),
      pick("Tung đồng xu 6 lần đều được mặt ngửa. Lần thứ 7 có chắc chắn là mặt sấp không?", "Không", ["Có", "Không", "Chắc chắn ngửa"],
        ["Đồng xu có “nhớ” các lần tung trước không?", "Mỗi lần tung vẫn chỉ có hai khả năng: sấp hoặc ngửa.", "Kết quả trước có bắt buộc kết quả sau không?"],
        "Chuỗi kết quả trước không làm lần sau trở thành chắc chắn.", "Ngộ nhận ngẫu nhiên",
        { wrong: { "Có": "Đồng xu không “bù” lại cho các lần trước. Lần thứ 7 vẫn có thể ngửa.", "Chắc chắn ngửa": "Sáu lần ngửa không bảo đảm lần sau cũng ngửa." } }),
      pick("Trò chơi nào công bằng hơn cho hai bạn?", fair, [fair, "Túi có 3 đỏ, 1 xanh: mỗi bạn chọn một màu", "Vòng quay có 3 phần của bạn A, 1 phần của bạn B"],
        ["Công bằng nghĩa là cơ hội của hai bạn thế nào?", "So phần của mỗi bạn: 1 và 1, hay 3 và 1?", "Chọn trò chơi mà hai bạn có phần bằng nhau."],
        "Hai mặt đồng xu có cơ hội như nhau.", "Công bằng",
        { wrong: { "Túi có 3 đỏ, 1 xanh: mỗi bạn chọn một màu": "Bạn chọn màu đỏ có 3 thẻ, bạn chọn xanh chỉ có 1 thẻ.", "Vòng quay có 3 phần của bạn A, 1 phần của bạn B": "Bạn A có 3 phần, bạn B chỉ có 1 phần." } }),
      byBand(band,
        pick(`Trong hộp có ${same} bi đỏ và ${same} bi xanh. Rút màu đỏ hay màu xanh dễ hơn?`, "Như nhau", ["Đỏ", "Xanh", "Như nhau"],
          ["Hai màu có số bi bằng nhau không?", `Đỏ: ${same} viên. Xanh: ${same} viên.`, "Số bi bằng nhau thì cơ hội thế nào?"],
          "Hai màu có cùng số bi nên khả năng như nhau.", "Chuyển giao",
          { wrong: { "Đỏ": "Số bi đỏ không nhiều hơn số bi xanh.", "Xanh": "Số bi xanh không nhiều hơn số bi đỏ." } }),
        pick(`Túi có ${same} bi đỏ và ${same + 2} bi xanh. Bỏ thêm vào 2 bi đỏ. Bây giờ rút màu nào dễ hơn?`, "Như nhau", ["Đỏ", "Xanh", "Như nhau"],
          ["Sau khi thêm, túi có bao nhiêu bi đỏ?", `Đỏ: ${same} + 2 = ${same + 2} viên. Xanh: ${same + 2} viên.`, "So số bi của hai màu sau khi thêm."],
          `Sau khi thêm có ${same + 2} đỏ và ${same + 2} xanh: như nhau.`, "Chuyển giao",
          { steps: 2, wrong: { "Xanh": "Đó là lúc chưa thêm bi. Hãy tính lại số bi đỏ sau khi thêm 2 viên.", "Đỏ": "Thêm 2 viên thì đỏ vừa bằng xanh, chưa nhiều hơn." } }),
        num(`Túi có ${same} bi đỏ và ${same + gap} bi xanh. Cần bỏ thêm ít nhất bao nhiêu bi đỏ để rút màu đỏ DỄ HƠN màu xanh?`, gap + 1,
          ["Muốn đỏ dễ rút hơn thì số bi đỏ phải thế nào so với số bi xanh?", `Đỏ đang ít hơn xanh ${gap} viên. Thêm ${gap} viên thì mới bằng nhau.`, "Bằng nhau thì chưa “dễ hơn”. Cần thêm một viên nữa."],
          `Thêm ${gap} viên thì bằng nhau; thêm ${gap + 1} viên thì đỏ nhiều hơn xanh.`, "Chuyển giao",
          { steps: 3, wrong: { [gap]: "Thêm chừng đó thì hai màu mới BẰNG nhau, chưa dễ hơn.", [same + gap]: "Đây là số bi xanh. Câu hỏi là số bi đỏ cần thêm." } }),
      ),
    ];
  }

  if (sequence === 4) {
    const low = 48 + v; const diff = 2 + mod(v, 3); const max = Math.max(...allValues);
    const first = "Nguồn, nhãn, đơn vị và trục"; const height = 2 + mod(v, 3); const times = 2 + mod(v, 2);
    return [
      num(`Hai cột biểu đồ có giá trị ${low} và ${low + diff}. Chênh lệch thật là bao nhiêu?`, diff,
        ["Nên so bằng chiều cao nhìn thấy hay bằng con số ghi trên cột?", `Đọc số: ${low + diff} và ${low}.`, `Tính ${low + diff} − ${low}.`],
        `${low + diff} − ${low} = ${diff}.`, "Đọc chính xác",
        { wrong: { [low + diff + low]: "Chênh lệch là phần hơn kém: dùng phép trừ.", [low + diff]: "Đây là giá trị cột cao hơn. Còn phải trừ cột thấp hơn." } }),
      pick("Trục dọc bắt đầu từ 40 thay vì 0 có thể làm khác biệt giữa hai cột trông thế nào?", "Lớn hơn thực tế", ["Lớn hơn thực tế", "Nhỏ hơn thực tế", "Không bao giờ đổi"],
        ["Khi trục bắt đầu từ 40, phần nào của mỗi cột không được vẽ?", "Hai cột 48 và 50 chỉ còn cao 8 ô và 10 ô trên hình.", "Phần chênh 2 ô so với cột cao 8 ô trông lớn hay nhỏ?"],
        "Cắt gốc trục có thể làm chênh lệch nhỏ trông rất lớn.", "Trục biểu đồ",
        { steps: 2, wrong: { "Nhỏ hơn thực tế": "Cắt bớt phần dưới làm các cột thấp đi, nên phần chênh trông to ra chứ không nhỏ đi.", "Không bao giờ đổi": "Con số không đổi, nhưng ấn tượng bằng mắt thì đổi." } }),
      pick("Biểu đồ không ghi đơn vị còn thiếu thông tin quan trọng nào?", "Các con số đo điều gì", ["Các con số đo điều gì", "Màu nào đẹp", "Ai vẽ", "Giấy khổ nào"],
        ["Số 5 trên cột có thể là 5 gì?", "5 bạn, 5 kg hay 5 phút là ba chuyện rất khác nhau.", "Thiếu đơn vị thì ta chưa biết điều gì về con số?"],
        "Không có đơn vị, ta chưa hiểu con số đo cái gì.", "Thông tin thiếu",
        { wrong: { "Màu nào đẹp": "Màu sắc không làm thay đổi ý nghĩa của số liệu.", "Ai vẽ": "Người vẽ không cho biết con số đo cái gì.", "Giấy khổ nào": "Khổ giấy không liên quan đến ý nghĩa số liệu." } }),
      num(`Dữ liệu ${allValues.join(", ")} có giá trị lớn nhất là bao nhiêu?`, max,
        ["Cần so mấy số với nhau?", "So từng số với số đang lớn nhất.", "Giữ lại số lớn nhất sau khi so hết bốn số."],
        `${max} là giá trị lớn nhất.`, "Đọc dữ liệu",
        { wrong: { [Math.min(...allValues)]: "Đây là giá trị nhỏ nhất.", [allValues.reduce((sum, value) => sum + value, 0)]: "Đây là tổng. Câu hỏi là giá trị lớn nhất." } }),
      byBand(band,
        pick("Trước khi tin một biểu đồ trên Internet, nên kiểm tra gì đầu tiên?", first, [first, "Màu sắc", "Có nhiều hình hay không", "Tiêu đề thật to"],
          ["Điều gì cho biết con số đến từ đâu và đo cái gì?", "Đọc phần chữ nhỏ quanh biểu đồ: ai làm, đo gì, trục bắt đầu từ đâu.", "Chọn nhóm thông tin giúp hiểu đúng con số."],
          "Nguồn, nhãn, đơn vị và trục giúp phát hiện biểu đồ gây hiểu lầm.", "Chuyển giao phản biện",
          { wrong: { "Màu sắc": "Màu đẹp không làm số liệu đúng hơn.", "Có nhiều hình hay không": "Hình minh hoạ không cho biết số liệu có đáng tin không.", "Tiêu đề thật to": "Tiêu đề to chỉ để gây chú ý." } }),
        num(`Trục dọc bắt đầu từ 40, mỗi ô là 1 đơn vị. Cột A có giá trị ${40 + height}, cột B có giá trị ${40 + height + diff}. Trên hình, cột B cao mấy ô?`, height + diff,
          ["Trên hình, cột chỉ được vẽ từ mốc nào trở lên?", `Cột A: ${40 + height} − 40 = ${height} ô.`, `Tính ${40 + height + diff} − 40.`],
          `Cột B cao ${40 + height + diff} − 40 = ${height + diff} ô.`, "Chuyển giao phản biện",
          { steps: 2, wrong: { [40 + height + diff]: "Trục bắt đầu từ 40 nên phần dưới 40 không được vẽ.", [diff]: "Đây là phần chênh giữa hai cột. Câu hỏi là chiều cao cột B trên hình." } }),
        num(`Trục dọc bắt đầu từ 40, mỗi ô là 1 đơn vị. Cột A có giá trị ${40 + height}, cột B có giá trị ${40 + times * height}. Trên hình, cột B cao gấp mấy lần cột A?`, times,
          ["Trên hình, mỗi cột cao mấy ô?", `Cột A cao ${height} ô; cột B cao ${40 + times * height} − 40 = ${times * height} ô.`, `Tính ${times * height} : ${height}.`],
          `Trên hình cột B cao ${times * height} ô, cột A cao ${height} ô: gấp ${times} lần, dù giá trị thật chỉ chênh ${(times - 1) * height}.`, "Chuyển giao phản biện",
          { steps: 3, wrong: { 1: "Tính từ 0 thì hai cột gần bằng nhau, nhưng hình chỉ vẽ phần trên mốc 40.", [(times - 1) * height]: "Đây là phần chênh lệch. Câu hỏi là gấp mấy lần." } }),
      ),
    ];
  }

  if (sequence === 5) {
    const coin = mod(v, 2) === 0; const tosses = 8 + v; const heads = 5 + mod(v, 4);
    const red = 3 + mod(v, 3); const blue = 2 + mod(v, 2); const parts = 3 + mod(v, 4);
    const trial = "Quay mỗi vòng nhiều lần như nhau và ghi kết quả";
    return [
      num(coin ? "Tung một đồng xu có bao nhiêu kết quả có thể?" : "Gieo một con xúc xắc 6 mặt có bao nhiêu kết quả có thể?", coin ? 2 : 6,
        [coin ? "Đồng xu có những mặt nào?" : "Con xúc xắc có những mặt nào?", coin ? "Liệt kê: sấp, ngửa." : "Liệt kê: 1 chấm, 2 chấm, … đến 6 chấm.", "Đếm các kết quả vừa liệt kê."],
        coin ? "Có 2 kết quả: sấp hoặc ngửa." : "Có 6 kết quả: từ 1 đến 6 chấm.", "Không gian mẫu",
        { wrong: { 1: "Mỗi lần chỉ ra một kết quả, nhưng câu hỏi là có bao nhiêu kết quả CÓ THỂ xảy ra.", [coin ? 6 : 2]: coin ? "Đồng xu chỉ có hai mặt." : "Xúc xắc có 6 mặt, không phải 2." } }),
      pick("Túi chỉ có thẻ đỏ. Rút được thẻ đỏ là sự kiện gì?", "Chắc chắn", ["Chắc chắn", "Có thể", "Không thể"],
        ["Trong túi có thẻ màu nào khác không?", "Mọi thẻ trong túi đều đỏ.", "Rút thẻ nào cũng ra cùng một màu thì gọi là gì?"],
        "Rút thẻ nào cũng đỏ, nên đây là sự kiện chắc chắn.", "Phân loại sự kiện",
        { wrong: { "Có thể": "“Có thể” là khi còn kết quả khác. Ở đây không có màu nào khác.", "Không thể": "“Không thể” là khi không bao giờ xảy ra. Ở đây lần nào cũng xảy ra." } }),
      pick(`Tung đồng xu ${tosses} lần được ${heads} lần ngửa. Có thể kết luận đồng xu chắc chắn bị lệch không?`, "Chưa thể", ["Có", "Chưa thể", "Chắc chắn cân đối"],
        ["Số lần thử như vậy là nhiều hay ít?", "Với ít lần thử, kết quả lệch một chút là chuyện bình thường.", "Muốn kết luận chắc hơn thì cần làm gì thêm?"],
        "Một mẫu nhỏ chưa đủ để chứng minh đồng xu lệch hay cân đối.", "Bằng chứng thử nghiệm",
        { wrong: { "Có": "Ít lần thử thì kết quả lệch là do may rủi, chưa phải bằng chứng.", "Chắc chắn cân đối": "Ít lần thử cũng chưa đủ để khẳng định đồng xu cân đối." } }),
      pick("Muốn so hai vòng quay, cách thử nào đáng tin hơn?", trial, ["Quay mỗi vòng một lần", trial, "Chọn vòng đẹp hơn", "Hỏi một người đoán"],
        ["So sánh thế nào thì công bằng cho cả hai vòng quay?", "Hai vòng phải được thử số lần như nhau, và phải thử nhiều lần.", "Kết quả nên được nhớ bằng trí nhớ hay ghi lại?"],
        "Nhiều lần thử có ghi chép giúp so sánh đáng tin hơn.", "Thiết kế thí nghiệm",
        { wrong: { "Quay mỗi vòng một lần": "Một lần thử thì kết quả chỉ là may rủi.", "Chọn vòng đẹp hơn": "Vẻ ngoài không cho biết kim dừng ở đâu.", "Hỏi một người đoán": "Lời đoán không phải dữ liệu." } }),
      byBand(band,
        pick("Trong túi có 3 thẻ đỏ, 2 thẻ xanh, 1 thẻ vàng. Màu nào ít khả năng được rút nhất?", "Vàng", ["Đỏ", "Xanh", "Vàng", "Như nhau"],
          ["Màu nào có ít thẻ nhất?", "Đỏ: 3. Xanh: 2. Vàng: 1.", "Màu ít thẻ nhất thì ít khả năng nhất."],
          "Vàng có ít thẻ nhất nên ít khả năng nhất.", "Chuyển giao",
          { wrong: { "Đỏ": "Đỏ có nhiều thẻ nhất, nên dễ rút nhất.", "Xanh": "Xanh có 2 thẻ, vẫn nhiều hơn vàng.", "Như nhau": "Ba màu có số thẻ khác nhau." } }),
        num(`Túi có ${red} bi đỏ, ${blue} bi xanh và 1 bi vàng. Có bao nhiêu viên bi KHÔNG phải màu đỏ?`, blue + 1,
          ["Những màu nào không phải màu đỏ?", `Xanh: ${blue} viên. Vàng: 1 viên.`, `Tính ${blue} + 1.`],
          `${blue} xanh + 1 vàng = ${blue + 1} viên không đỏ.`, "Chuyển giao",
          { steps: 2, wrong: { [red]: "Đây là số bi đỏ. Câu hỏi là bi KHÔNG đỏ.", [red + blue + 1]: "Đây là tất cả số bi. Phải bỏ bi đỏ ra." } }),
        num(`Quay một vòng quay có ${parts} phần bằng nhau đánh số từ 1 đến ${parts}, rồi tung một đồng xu. Có bao nhiêu kết quả mà đồng xu ra mặt ngửa và vòng quay KHÔNG dừng ở số 1?`, parts - 1,
          ["Đồng xu đã cố định là ngửa; vòng quay còn được dừng ở những số nào?", `Vòng quay có ${parts} số; bỏ số 1.`, "Đếm xem vòng quay còn lại bao nhiêu số được phép."],
          `Đồng xu ngửa, vòng quay dừng ở một trong các số 2 đến ${parts}: có ${parts - 1} kết quả.`, "Chuyển giao",
          { steps: 3, wrong: { [parts]: "Phải bỏ trường hợp vòng quay dừng ở số 1.", [2 * parts]: "Đây là tất cả kết quả. Câu hỏi chỉ lấy mặt ngửa và bỏ số 1.", [2 * (parts - 1)]: "Đồng xu phải là mặt ngửa, không tính mặt sấp." } }),
      ),
    ];
  }

  const sample = 12 + 6 * mod(v, 5); const neutral = "Bạn thích món nào nhất?";
  const report = "Câu hỏi, số người và cách chọn người"; const sameWay = "Hỏi cùng câu hỏi theo cùng cách";
  return [
    pick("Muốn biết món ăn yêu thích của cả lớp, câu hỏi nào ít dẫn dắt nhất?", neutral, [neutral, "Bạn cũng thích pizza nhất đúng không?", "Pizza ngon hơn phở phải không?"],
      ["Câu hỏi nào đã gợi sẵn một món ăn?", "Tìm những từ như “đúng không”, “phải không”.", "Chọn câu không nhắc trước tên món nào."],
      "Câu hỏi mở, trung lập làm giảm thiên lệch.", "Câu hỏi khảo sát",
      { wrong: { "Bạn cũng thích pizza nhất đúng không?": "Câu này đã gợi sẵn pizza và mong người nghe đồng ý.", "Pizza ngon hơn phở phải không?": "Câu này chỉ cho so hai món và nghiêng về pizza." } }),
    num(`Khảo sát ${sample} bạn: ${sample / 2} bạn chọn đọc sách, ${sample / 3} bạn chọn vẽ, còn lại chọn thể thao. Có bao nhiêu bạn chọn thể thao?`, sample / 6,
      ["Hai hoạt động đầu đã có bao nhiêu bạn chọn?", `${sample / 2} + ${sample / 3} = ${sample / 2 + sample / 3} bạn.`, `Lấy ${sample} trừ ${sample / 2 + sample / 3}.`],
      `${sample} − ${sample / 2 + sample / 3} = ${sample / 6} bạn.`, "Tổng hợp khảo sát",
      { steps: 2, wrong: { [sample / 2 + sample / 3]: "Đây là số bạn chọn đọc sách và vẽ. Thể thao là phần còn lại.", [sample - sample / 2]: "Con mới trừ các bạn chọn đọc sách. Còn các bạn chọn vẽ." } }),
    pick("Chỉ hỏi các bạn trong câu lạc bộ bóng đá để biết môn thể thao yêu thích của toàn trường có hợp lý không?", "Không", ["Có", "Không", "Luôn chính xác"],
      ["Các bạn trong câu lạc bộ bóng đá có giống mọi bạn khác trong trường không?", "Đã vào câu lạc bộ bóng đá thì phần lớn sẽ chọn bóng đá.", "Nhóm được hỏi có đại diện cho cả trường không?"],
      "Mẫu khảo sát bị lệch về bóng đá nên không đại diện toàn trường.", "Chọn mẫu",
      { wrong: { "Có": "Nhóm này thích bóng đá hơn các bạn khác, nên kết quả bị lệch.", "Luôn chính xác": "Hỏi một nhóm có sở thích riêng thì không thể chính xác cho cả trường." } }),
    pick("Thông tin nào cần ghi cùng kết quả khảo sát?", report, [report, "Màu bút", "Tên người vẽ biểu đồ", "Kích thước giấy"],
      ["Người đọc cần biết gì để tin được kết quả?", "Hỏi câu gì? Hỏi bao nhiêu người? Chọn người hỏi thế nào?", "Chọn nhóm thông tin trả lời ba câu hỏi ấy."],
      "Những thông tin này cho phép đánh giá độ tin cậy của khảo sát.", "Minh bạch dữ liệu",
      { wrong: { "Màu bút": "Màu bút không ảnh hưởng đến kết quả.", "Tên người vẽ biểu đồ": "Tên người vẽ không cho biết khảo sát được làm thế nào.", "Kích thước giấy": "Khổ giấy không liên quan đến độ tin cậy." } }),
    byBand(band,
      pick("Muốn so sở thích giữa hai lớp, điều kiện nào quan trọng?", sameWay, [sameWay, "Dùng hai màu biểu đồ khác nhau", "Chỉ hỏi lớp đông hơn", "Hỏi vào hai năm khác nhau"],
        ["So sánh thế nào thì công bằng cho cả hai lớp?", "Nếu mỗi lớp được hỏi một kiểu thì câu trả lời khác nhau có thể là do cách hỏi.", "Chọn điều kiện giữ mọi thứ giống nhau ở hai lớp."],
        "Cùng câu hỏi, cùng cách hỏi thì so sánh mới có ý nghĩa.", "Chuyển giao",
        { wrong: { "Dùng hai màu biểu đồ khác nhau": "Màu chỉ giúp dễ nhìn, không làm việc so sánh công bằng hơn.", "Chỉ hỏi lớp đông hơn": "Hỏi một lớp thì không có gì để so.", "Hỏi vào hai năm khác nhau": "Sở thích có thể đổi theo thời gian, nên nên hỏi cùng lúc." } }),
      num(`Khảo sát ${sample} bạn: một nửa chọn bơi; trong số còn lại có 3 bạn chọn cầu lông, các bạn khác chọn chạy. Có bao nhiêu bạn chọn chạy?`, sample / 2 - 3,
        ["Sau khi bỏ các bạn chọn bơi, còn bao nhiêu bạn?", `Một nửa của ${sample} là ${sample / 2}; còn lại ${sample / 2} bạn.`, `Lấy ${sample / 2} trừ 3.`],
        `Còn ${sample / 2} bạn; bỏ 3 bạn chọn cầu lông, còn ${sample / 2 - 3} bạn chọn chạy.`, "Chuyển giao",
        { steps: 2, wrong: { [sample / 2]: "Con quên trừ 3 bạn chọn cầu lông.", [sample - 3]: "Con quên một nửa số bạn đã chọn bơi." } }),
      num(`Khảo sát ${sample} bạn: một nửa chọn đọc sách, một phần ba chọn vẽ, còn lại chọn thể thao. Số bạn chọn đọc sách nhiều hơn số bạn chọn thể thao bao nhiêu?`, sample / 2 - sample / 6,
        ["Mỗi hoạt động có bao nhiêu bạn chọn?", `Đọc sách: ${sample} : 2 = ${sample / 2}. Vẽ: ${sample} : 3 = ${sample / 3}. Thể thao: phần còn lại.`, "Tìm số bạn chọn thể thao, rồi lấy số bạn đọc sách trừ đi."],
        `Đọc sách ${sample / 2}, vẽ ${sample / 3}, thể thao ${sample / 6}; hơn nhau ${sample / 2} − ${sample / 6} = ${sample / 2 - sample / 6}.`, "Chuyển giao",
        { steps: 3, wrong: { [sample / 6]: "Đây là số bạn chọn thể thao. Câu hỏi là đọc sách hơn thể thao bao nhiêu.", [sample / 2]: "Đây là số bạn chọn đọc sách. Còn phải trừ số bạn chọn thể thao." } }),
    ),
  ];
}
