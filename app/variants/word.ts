// Miền "Logic và giải quyết vấn đề" — 6 chặng × 12 phiên bản × 3 dải.
import { byBand, mod, num, pick, type Band, type Q } from "./kit";

export function wordQuestions(sequence: number, v: number, band: Band): Q[] {
  const easy = band === "support";

  if (sequence === 1) {
    const x = easy ? 2 + mod(v, 5) : 6 + mod(v, 10); const mult = easy ? 2 + mod(v, 3) : 3 + mod(v, 5); const add = 4 + mod(v, 9); const out = x * mult + add;
    const check = `${x} × ${mult} + ${add}`; const plain = 12 + v;
    return [
      num(`Một số được nhân ${mult} rồi cộng ${add}, kết quả ${out}. Số ban đầu là bao nhiêu?`, x,
        ["Thao tác nào được làm sau cùng?", `Tháo “cộng ${add}” trước: ${out} − ${add} = ${out - add}.`, `Rồi tháo “nhân ${mult}”: lấy ${out - add} chia cho ${mult}.`],
        `${out} − ${add} = ${out - add}; ${out - add} : ${mult} = ${x}.`, "Suy luận ngược",
        { steps: 2, wrong: { [out - add]: `Con mới tháo phép cộng. Còn phải tháo “nhân ${mult}”.`, [out * mult + add]: "Con đã làm xuôi. Muốn tìm số ban đầu thì đi ngược." } }),
      num(`An có một số bi. An cho bạn ${add} viên, rồi chia đều số còn lại vào ${mult} hộp, mỗi hộp ${x} viên. Ban đầu An có bao nhiêu viên?`, out,
        ["Trước khi chia vào hộp, An còn bao nhiêu viên?", `Trong các hộp có ${mult} × ${x} = ${x * mult} viên.`, `Cộng lại ${add} viên An đã cho bạn.`],
        `Các hộp có ${x * mult} viên; thêm ${add} viên đã cho: ${out} viên.`, "Khôi phục trạng thái",
        { steps: 2, wrong: { [x * mult]: `Đây là số bi trong các hộp. An còn cho bạn ${add} viên trước đó.`, [x * mult - add]: "An đã CHO đi, nên lúc đầu phải nhiều hơn: cộng lại chứ không trừ." } }),
      pick("Khi giải ngược một chuỗi thao tác, cần làm theo thứ tự nào?", "Tháo thao tác cuối trước", ["Tháo thao tác cuối trước", "Tháo thao tác đầu trước", "Tháo theo thứ tự nào cũng được", "Chỉ cần đoán"],
        ["Khi cởi áo khoác và áo len, con cởi cái nào trước?", "Cái mặc sau cùng nằm ở ngoài cùng.", "Thao tác làm sau cùng cũng nằm “ngoài cùng”."],
        "Phải tháo thao tác cuối trước và dùng phép tính ngược.", "Chiến lược",
        { wrong: { "Tháo thao tác đầu trước": "Thao tác đầu bị các thao tác sau “bọc” lại, chưa tháo được ngay.", "Tháo theo thứ tự nào cũng được": "Đổi thứ tự tháo sẽ ra số khác. Thử với một ví dụ nhỏ.", "Chỉ cần đoán": "Đoán không cho biết vì sao đáp án đúng." } }),
      pick(`Một số nhân ${mult} rồi cộng ${add} thì được ${out}. Muốn kiểm tra đáp án ${x}, con dùng phép tính nào?`, check, [check, `${x} + ${mult} + ${add}`, `${out} + ${add}`, `${x} × ${add}`],
        ["Đề bài đã làm gì với số ban đầu?", `Nhân ${mult} trước, rồi cộng ${add}.`, `Làm lại đúng hai thao tác ấy với ${x}; kết quả phải ra ${out}.`],
        "Đi xuôi từ đáp án là phép kiểm tra trực tiếp.", "Kiểm chứng",
        { wrong: { [`${x} + ${mult} + ${add}`]: "Đề dùng phép nhân rồi phép cộng, không phải cộng cả ba số.", [`${out} + ${add}`]: "Phép tính này không dùng đến số vừa tìm.", [`${x} × ${add}`]: `Đề nhân với ${mult}, không phải nhân với ${add}.` } }),
      byBand(band,
        num(`Một số cộng ${add} thì được ${plain + add}. Số đó là bao nhiêu?`, plain,
          ["Phép tính nào tháo được phép cộng?", `□ + ${add} = ${plain + add}.`, `Tính ${plain + add} − ${add}.`],
          `${plain + add} − ${add} = ${plain}.`, "Chuyển giao",
          { wrong: { [plain + 2 * add]: "Con đã cộng thêm. Muốn tháo phép cộng thì dùng phép trừ." } }),
        num(`Một số cộng ${add + 2}, rồi gấp ${mult + 1} lần thì được ${(x + add + 2) * (mult + 1)}. Số đó là bao nhiêu?`, x,
          ["Thao tác nào được làm sau cùng?", `Tháo “gấp ${mult + 1} lần”: ${(x + add + 2) * (mult + 1)} : ${mult + 1} = ${x + add + 2}.`, `Rồi lấy ${x + add + 2} trừ ${add + 2}.`],
          `Chia ${mult + 1} được ${x + add + 2}; trừ ${add + 2} được ${x}.`, "Chuyển giao",
          { steps: 2, wrong: { [x + add + 2]: `Con mới tháo phép nhân. Còn phải tháo “cộng ${add + 2}”.` } }),
        num(`Một số nhân 2, cộng ${add}, rồi gấp ${mult} lần thì được ${(2 * x + add) * mult}. Số đó là bao nhiêu?`, x,
          ["Chuỗi này có mấy thao tác, và thao tác nào làm sau cùng?", `Đi ngược: chia ${mult}, rồi trừ ${add}, rồi chia 2.`, `${(2 * x + add) * mult} : ${mult} = ${2 * x + add}; tiếp tục trừ ${add} rồi chia 2.`],
          `Chia ${mult} được ${2 * x + add}; trừ ${add} được ${2 * x}; chia 2 được ${x}.`, "Chuyển giao",
          { steps: 3, wrong: { [2 * x]: "Con còn một thao tác chưa tháo: số ban đầu đã được nhân 2.", [2 * x + add]: "Con mới tháo thao tác cuối. Còn hai thao tác nữa." } }),
      ),
    ];
  }

  if (sequence === 2) {
    const heads = easy ? 5 + mod(v, 4) : 10 + mod(v, 8); const dogs = easy ? 1 + mod(v, 3) : 3 + mod(v, heads - 4); const legs = 2 * heads + 2 * dogs;
    const vehicles = heads + 2; const trikes = dogs + 1; const wheels = 2 * vehicles + trikes;
    return [
      num(`Có ${heads} con gồm gà 2 chân và chó 4 chân, tổng ${legs} chân. Có bao nhiêu con chó?`, dogs,
        ["Nếu cả đàn đều là gà thì có bao nhiêu chân?", `Giả sử toàn gà: ${heads} × 2 = ${2 * heads} chân. Thực tế nhiều hơn ${legs - 2 * heads} chân.`, "Mỗi lần đổi một con gà thành một con chó thì thêm 2 chân. Cần đổi mấy lần?"],
        `Thừa ${legs - 2 * heads} chân; mỗi con chó thêm 2 chân, nên có ${legs - 2 * heads} : 2 = ${dogs} con chó.`, "Giả sử rồi điều chỉnh",
        { steps: 3, wrong: { [legs - 2 * heads]: "Đây là số chân còn thừa. Mỗi con chó chỉ thêm 2 chân, nên còn phải chia 2.", [heads - dogs]: "Đây là số gà. Câu hỏi là số chó." } }),
      num(`Đàn có ${heads} con gồm gà và chó, trong đó có ${dogs} con chó. Có bao nhiêu con gà?`, heads - dogs,
        ["Đàn chỉ gồm những loại con nào?", `${dogs} con chó + □ con gà = ${heads} con.`, `Tính ${heads} − ${dogs}.`],
        `${heads} − ${dogs} = ${heads - dogs} con gà.`, "Hoàn thiện nghiệm",
        { wrong: { [dogs]: "Đây là số chó. Gà là phần còn lại của đàn.", [heads]: "Đây là cả đàn. Phải bỏ số chó ra." } }),
      pick("Vì sao mỗi lần đổi một con gà thành một con chó, tổng số chân tăng 2?", "Vì 4 − 2 = 2", ["Vì 4 − 2 = 2", "Vì có thêm một con", "Vì 4 + 2 = 6", "Vì chó nặng hơn"],
        ["Khi đổi, số con trong đàn có thay đổi không?", "Bớt một con 2 chân, thêm một con 4 chân.", "Số chân thêm vào chính là phần chó hơn gà."],
        "Mỗi lần thay một con gà bằng một con chó, số chân tăng đúng 4 − 2 = 2.", "Giải thích điều chỉnh",
        { wrong: { "Vì có thêm một con": "Số con không đổi: một con gà ra, một con chó vào.", "Vì 4 + 2 = 6": "Ta thay chứ không thêm: bớt 2 chân gà rồi mới thêm 4 chân chó.", "Vì chó nặng hơn": "Cân nặng không liên quan đến số chân." } }),
      num(`Kiểm tra: ${dogs} con chó và ${heads - dogs} con gà có tất cả bao nhiêu chân?`, legs,
        ["Mỗi nhóm có bao nhiêu chân?", `Chó: ${dogs} × 4 = ${dogs * 4}. Gà: ${heads - dogs} × 2 = ${(heads - dogs) * 2}.`, "Cộng số chân của hai nhóm."],
        `${dogs * 4} + ${(heads - dogs) * 2} = ${legs} chân.`, "Kiểm tra hai điều kiện",
        { steps: 2, wrong: { [heads * 4]: "Không phải con nào cũng có 4 chân: gà chỉ có 2 chân.", [heads * 2]: "Không phải con nào cũng có 2 chân: chó có 4 chân." } }),
      byBand(band,
        num(`Có ${heads} con gà. Tất cả có bao nhiêu chân?`, 2 * heads,
          ["Mỗi con gà có mấy chân?", `${heads} con, mỗi con 2 chân.`, `Tính ${heads} × 2.`],
          `${heads} × 2 = ${2 * heads} chân.`, "Chuyển giao",
          { wrong: { [4 * heads]: "Gà có 2 chân, không phải 4 chân.", [heads + 2]: "Mỗi con đều có 2 chân: nhân chứ không cộng." } }),
        num(`Có ${heads + 2} xe gồm xe đạp 2 bánh và ô tô 4 bánh, tổng ${legs + 6} bánh. Có bao nhiêu ô tô?`, dogs + 1,
          ["Nếu tất cả đều là xe đạp thì có bao nhiêu bánh?", `Giả sử toàn xe đạp: ${heads + 2} × 2 = ${2 * (heads + 2)} bánh. Thực tế nhiều hơn ${legs + 6 - 2 * (heads + 2)} bánh.`, "Mỗi ô tô thay cho một xe đạp thì thêm 2 bánh. Cần thay mấy xe?"],
          `Thừa ${legs + 6 - 2 * (heads + 2)} bánh; mỗi ô tô thêm 2 bánh, nên có ${dogs + 1} ô tô.`, "Chuyển giao",
          { steps: 2, wrong: { [legs + 6 - 2 * (heads + 2)]: "Đây là số bánh còn thừa. Mỗi ô tô thêm 2 bánh, nên còn phải chia 2." } }),
        num(`Có ${vehicles} xe gồm xe đạp 2 bánh và xe ba bánh, tổng ${wheels} bánh. Có bao nhiêu xe đạp?`, vehicles - trikes,
          ["Nếu tất cả đều là xe đạp thì có bao nhiêu bánh?", `Giả sử toàn xe đạp: ${2 * vehicles} bánh. Thực tế nhiều hơn ${trikes} bánh; mỗi xe ba bánh chỉ thêm 1 bánh.`, "Tìm số xe ba bánh trước, rồi lấy tổng số xe trừ đi."],
          `Thừa ${trikes} bánh nên có ${trikes} xe ba bánh; xe đạp: ${vehicles} − ${trikes} = ${vehicles - trikes}.`, "Chuyển giao",
          { steps: 3, wrong: { [trikes]: "Đây là số xe ba bánh. Câu hỏi là số xe đạp.", [vehicles]: "Đây là tất cả số xe. Phải bỏ xe ba bánh ra." } }),
      ),
    ];
  }

  if (sequence === 3) {
    const target = easy ? 6 + mod(v, 4) : 12 + mod(v, 9); const lowHalf = Math.floor(target / 2); const highHalf = Math.ceil(target / 2);
    const sumProduct = `${target} và ${lowHalf * highHalf}`; const small = 4 + mod(v, 3); const big = target + 2;
    return [
      num(`Tìm tất cả cặp số tự nhiên lớn hơn 0 có tổng ${target}. Nếu không phân biệt thứ tự, có bao nhiêu cặp?`, lowHalf,
        ["Nên bắt đầu liệt kê từ cặp nào để không sót?", `1 + ${target - 1}, 2 + ${target - 2}, 3 + ${target - 3}, …`, "Dừng khi số thứ nhất sắp lớn hơn số thứ hai, rồi đếm các cặp."],
        `Số thứ nhất chạy từ 1 đến ${lowHalf}: có ${lowHalf} cặp.`, "Nhiều nghiệm",
        { steps: 2, wrong: { [target - 1]: "Con đếm cả các cặp đổi chỗ (như 1 + 4 và 4 + 1). Đề không phân biệt thứ tự.", [target]: "Số 0 không được dùng: hai số đều lớn hơn 0." } }),
      num(`Mua tổng cộng ${target} món gồm bánh và sữa, mỗi loại ít nhất 1 món. Có bao nhiêu cách chọn số bánh?`, target - 1,
        ["Số bánh ít nhất là bao nhiêu, nhiều nhất là bao nhiêu?", `Bánh từ 1 đến ${target - 1}; khi đó số sữa tự xác định.`, "Mỗi số bánh có thể chọn là một cách: đếm xem có bao nhiêu số như vậy."],
        `Số bánh có thể là 1, 2, …, ${target - 1}: có ${target - 1} cách.`, "Đếm nghiệm",
        { steps: 2, wrong: { [lowHalf]: "Ở đây 3 bánh 5 sữa khác 5 bánh 3 sữa, nên phải tính cả hai.", [target]: `Không thể mua ${target} bánh vì cần ít nhất 1 hộp sữa.` } }),
      pick(`Trong các cặp số lớn hơn 0 có tổng ${target}, tích lớn nhất khi hai số thế nào?`, "Gần nhau nhất", ["Gần nhau nhất", "Một số bằng 1", "Cách xa nhau nhất", "Hai số nào cũng cho tích như nhau"],
        ["Tích thay đổi thế nào khi hai số tiến lại gần nhau?", `1 × ${target - 1} = ${target - 1}; 2 × ${target - 2} = ${2 * (target - 2)}; 3 × ${target - 3} = ${3 * (target - 3)}.`, "Tiếp tục tính với các cặp gần nhau hơn rồi so sánh."],
        "Với tổng cố định, hai số càng gần nhau thì tích càng lớn.", "Tối ưu trong nhiều nghiệm",
        { steps: 2, wrong: { "Một số bằng 1": `1 × ${target - 1} chỉ được ${target - 1}, là tích nhỏ nhất.`, "Cách xa nhau nhất": `Cặp xa nhau nhất là 1 và ${target - 1}, cho tích nhỏ nhất.`, "Hai số nào cũng cho tích như nhau": `Thử tính 1 × ${target - 1} và 2 × ${target - 2}: hai tích khác nhau.` } }),
      pick(`Cặp ${lowHalf} và ${highHalf} có tổng và tích lần lượt là gì?`, sumProduct, [sumProduct, `${target + 1} và ${target}`, `${lowHalf} và ${highHalf}`],
        ["Tổng là kết quả phép tính nào, tích là kết quả phép tính nào?", `Tổng: ${lowHalf} + ${highHalf}. Tích: ${lowHalf} × ${highHalf}.`, "Tính hai phép tính ấy rồi tìm lựa chọn ghi đúng thứ tự tổng trước, tích sau."],
        `${lowHalf} + ${highHalf} = ${target}; ${lowHalf} × ${highHalf} = ${lowHalf * highHalf}.`, "Đa điều kiện",
        { steps: 2, wrong: { [`${target + 1} và ${target}`]: `Con tính lại tổng ${lowHalf} + ${highHalf}.`, [`${lowHalf} và ${highHalf}`]: "Đây là hai số ban đầu, chưa phải tổng và tích." } }),
      byBand(band,
        num(`Viết ${small} thành tổng của hai số lớn hơn 0, có phân biệt thứ tự (1 + 3 khác 3 + 1). Có bao nhiêu cách?`, small - 1,
          ["Số thứ nhất có thể là những số nào?", `Số thứ nhất từ 1 đến ${small - 1}; số thứ hai là phần còn lại.`, "Mỗi giá trị của số thứ nhất là một cách: đếm xem có bao nhiêu giá trị."],
          `Số thứ nhất là 1, 2, …, ${small - 1}: có ${small - 1} cách.`, "Chuyển giao",
          { wrong: { [small]: "Số thứ nhất không thể bằng cả tổng, vì số thứ hai phải lớn hơn 0." } }),
        num(`Tìm số cặp số tự nhiên x, y (được phép bằng 0) thỏa x + y = ${big}. Có bao nhiêu cặp có thứ tự?`, big + 1,
          ["x có thể nhỏ nhất là bao nhiêu và lớn nhất là bao nhiêu?", `x chạy từ 0 đến ${big}; mỗi x có đúng một y.`, `Đếm các số từ 0 đến ${big} (nhớ tính cả số 0).`],
          `x nhận các giá trị 0, 1, …, ${big}: có ${big + 1} cặp.`, "Chuyển giao",
          { steps: 2, wrong: { [big]: "Con quên trường hợp x = 0.", [big - 1]: "Ở đây được phép dùng số 0 cho cả x và y." } }),
        num(`Tìm số cặp số tự nhiên x, y (được phép bằng 0) thỏa x + y = ${big} và x lớn hơn y. Có bao nhiêu cặp?`, Math.ceil(big / 2),
          ["Muốn x lớn hơn y thì y được lớn nhất là bao nhiêu?", `y = 0 thì x = ${big}; y = 1 thì x = ${big - 1}; … Dừng khi y sắp bằng hoặc vượt x.`, `Tìm số y lớn nhất mà y vẫn nhỏ hơn ${big} − y, rồi đếm từ 0 đến số đó.`],
          `y nhận các giá trị 0 đến ${Math.ceil(big / 2) - 1}: có ${Math.ceil(big / 2)} cặp.`, "Chuyển giao",
          { steps: 3, wrong: { [big + 1]: "Đây là mọi cặp. Phải bỏ các cặp có x nhỏ hơn hoặc bằng y.", [Math.ceil(big / 2) + 1]: "Kiểm tra cặp cuối cùng: x có thật sự LỚN HƠN y không?" } }),
      ),
    ];
  }

  if (sequence === 4) {
    // Khoảng mở (low, low + 4) với low chẵn chứa đúng ba số, trong đó chỉ số ở giữa là số chẵn.
    const low = 20 + 2 * v; const from = 30 + v; const threes = Array.from({ length: 5 }, (_, index) => from + 1 + index).filter((value) => value % 3 === 0).length;
    const sixFrom = 40 + v; const six = Array.from({ length: 6 }, (_, index) => sixFrom + 1 + index).find((value) => value % 6 === 0)!;
    const twelve = 12 * (3 + mod(v, 4)); const twelveFrom = twelve - 2 - mod(v, 5);
    const unique = "Chỉ còn đúng một số thỏa tất cả";
    return [
      pick(`Cần tìm một số. Manh mối 1: lớn hơn ${low}. Manh mối 2: nhỏ hơn ${low + 4}. Có xác định duy nhất không?`, "Không", ["Có", "Không", "Chỉ khi số chẵn"],
        ["Có những số nào nằm giữa hai mốc ấy?", `Các số ở giữa: ${low + 1}, ${low + 2}, ${low + 3}.`, "Còn mấy số thỏa cả hai manh mối?"],
        "Còn ba số cùng thỏa, nên hai manh mối chưa đủ.", "Manh mối thiếu",
        { wrong: { "Có": `Có tới ba số thỏa: ${low + 1}, ${low + 2}, ${low + 3}.`, "Chỉ khi số chẵn": "Đề chưa cho manh mối nào về chẵn hay lẻ." } }),
      num(`Một số lớn hơn ${low} và nhỏ hơn ${low + 4}. Thêm manh mối “số đó là số chẵn”. Số cần tìm là bao nhiêu?`, low + 2,
        ["Trong các số ở giữa, số nào chẵn?", `Xét ${low + 1}, ${low + 2}, ${low + 3}: nhìn chữ số tận cùng.`, "Giữ lại số có chữ số tận cùng là 0, 2, 4, 6 hoặc 8."],
        `Trong ${low + 1}, ${low + 2}, ${low + 3} chỉ có ${low + 2} là số chẵn.`, "Lọc điều kiện",
        { steps: 2, wrong: { [low + 1]: "Số này là số lẻ.", [low + 3]: "Số này là số lẻ.", [low + 4]: `Số cần tìm phải NHỎ HƠN ${low + 4}.` } }),
      pick("Một bộ manh mối tốt để tìm duy nhất một số cần điều gì?", unique, [unique, "Có thật nhiều câu chữ", "Luôn nhắc màu sắc", "Có ít nhất một phép cộng"],
        ["Sau khi dùng hết manh mối, nên còn lại mấy số?", "Mỗi manh mối loại bớt một số ứng viên.", "Bộ manh mối đủ khi danh sách ứng viên còn bao nhiêu số?"],
        "Manh mối đủ khi chỉ còn một số thỏa tất cả.", "Đủ dữ kiện",
        { wrong: { "Có thật nhiều câu chữ": "Nhiều chữ chưa chắc loại được thêm số nào.", "Luôn nhắc màu sắc": "Màu sắc không giúp xác định một con số.", "Có ít nhất một phép cộng": "Có phép cộng hay không không quan trọng; quan trọng là còn lại mấy số." } }),
      num(`Số cần tìm nằm giữa ${from} và ${from + 6}, chia hết cho 3. Có bao nhiêu khả năng?`, threes,
        ["Những số nào nằm giữa hai mốc (không lấy hai đầu)?", `Các số: ${from + 1}, ${from + 2}, ${from + 3}, ${from + 4}, ${from + 5}.`, "Thử chia từng số cho 3 và đếm những số chia hết."],
        `Trong năm số ở giữa có ${threes} số chia hết cho 3.`, "Giao điều kiện",
        { steps: 2, wrong: { 5: "Con đếm mọi số ở giữa. Phải lọc những số chia hết cho 3.", [threes === 1 ? 2 : 1]: "Con thử chia lại từng số cho 3." } }),
      byBand(band,
        num(`Tìm số lẻ lớn hơn ${low} và nhỏ hơn ${low + 3}.`, low + 1,
          ["Có những số nào nằm giữa hai mốc ấy?", `Các số ở giữa: ${low + 1} và ${low + 2}.`, "Chọn số có chữ số tận cùng là 1, 3, 5, 7 hoặc 9."],
          `Trong ${low + 1} và ${low + 2}, số lẻ là ${low + 1}.`, "Chuyển giao",
          { wrong: { [low + 2]: "Số này là số chẵn.", [low + 3]: `Số cần tìm phải NHỎ HƠN ${low + 3}.` } }),
        num(`Tìm số lớn hơn ${sixFrom}, nhỏ hơn ${sixFrom + 7}, vừa chẵn vừa chia hết cho 3.`, six,
          ["Số vừa chẵn vừa chia hết cho 3 thì chia hết cho số nào?", `Các số ở giữa: ${sixFrom + 1} đến ${sixFrom + 6}. Gạch các số lẻ trước.`, "Trong các số chẵn còn lại, thử chia cho 3."],
          `Số vừa chẵn vừa chia hết cho 3 trong khoảng này là ${six}.`, "Chuyển giao",
          { steps: 2, wrong: { [six + 3 <= sixFrom + 6 ? six + 3 : six - 3]: "Số này chia hết cho 3 nhưng là số lẻ." } }),
        num(`Tìm số lớn hơn ${twelveFrom}, nhỏ hơn ${twelveFrom + 12}, chia hết cho 3 và chia hết cho 4.`, twelve,
          ["Nên lọc theo điều kiện nào trước để còn ít số nhất?", `Các số chia hết cho 4 trong khoảng: ${[twelve - 8, twelve - 4, twelve, twelve + 4, twelve + 8].filter((value) => value > twelveFrom && value < twelveFrom + 12).join(", ")}.`, "Thử chia từng số ấy cho 3."],
          `Trong khoảng này chỉ có ${twelve} vừa chia hết cho 3 vừa chia hết cho 4.`, "Chuyển giao",
          { steps: 3, wrong: { [twelve - 6 > twelveFrom ? twelve - 6 : twelve + 6]: "Số này chia hết cho 3 nhưng không chia hết cho 4.", [twelve + 4 < twelveFrom + 12 ? twelve + 4 : twelve - 4]: "Số này chia hết cho 4 nhưng không chia hết cho 3." } }),
      ),
    ];
  }

  if (sequence === 5) {
    // Thẻ A luôn nhiều điểm hơn thẻ B, nên đổi một thẻ B lấy một thẻ A làm tổng TĂNG (không có số âm).
    const priceB = 2 + mod(v, 3); const priceA = priceB + 2 + mod(v, 4);
    const countA = easy ? 1 + mod(v, 3) : 2 + mod(v, 5); const countB = easy ? 1 + mod(v + 1, 3) : 3 + mod(v + 1, 4);
    const target = countA * priceA + countB * priceB; const plan = `${countA} thẻ A và ${countB} thẻ B`;
    const deliberate = "Ghi lại kết quả và thay đổi một yếu tố có chủ đích"; const twoMoves = "Thêm 2 thẻ A và bớt 1 thẻ B";
    return [
      pick(`Cần đạt tổng ${target} điểm. Mỗi thẻ A được ${priceA} điểm, mỗi thẻ B được ${priceB} điểm. Phương án nào phù hợp?`, plan, [plan, `${countA + 1} thẻ A và ${countB} thẻ B`, `${countA} thẻ A và ${countB + 1} thẻ B`],
        ["Mỗi phương án cho tổng bao nhiêu điểm?", `Thử phương án ${plan}: ${countA} × ${priceA} + ${countB} × ${priceB}.`, "Tính tổng của từng phương án và so với mục tiêu."],
        `${countA} × ${priceA} + ${countB} × ${priceB} = ${target} điểm.`, "Thử và sửa",
        { steps: 2, wrong: { [`${countA + 1} thẻ A và ${countB} thẻ B`]: `Phương án này thừa một thẻ A: tổng vượt mục tiêu ${priceA} điểm.`, [`${countA} thẻ A và ${countB + 1} thẻ B`]: `Phương án này thừa một thẻ B: tổng vượt mục tiêu ${priceB} điểm.` } }),
      num(`Thẻ A được ${priceA} điểm, thẻ B được ${priceB} điểm. ${plan[0].toLocaleUpperCase("vi")}${plan.slice(1)} được tổng bao nhiêu điểm?`, target,
        ["Mỗi loại thẻ đóng góp bao nhiêu điểm?", `Thẻ A: ${countA} × ${priceA} = ${countA * priceA}. Thẻ B: ${countB} × ${priceB} = ${countB * priceB}.`, "Cộng điểm của hai loại thẻ."],
        `${countA * priceA} + ${countB * priceB} = ${target} điểm.`, "Kiểm tra phương án",
        { steps: 2, wrong: { [countA + countB]: "Đây là số thẻ. Mỗi thẻ có số điểm riêng.", [(countA + countB) * priceA]: `Thẻ B chỉ được ${priceB} điểm, không phải ${priceA} điểm.` } }),
      pick("Thử và sửa có chiến lược khác đoán mò ở điểm nào?", deliberate, [deliberate, "Thử thật nhanh", "Không cần kiểm tra", "Luôn bắt đầu bằng số lớn nhất"],
        ["Sau một lần thử sai, con học được gì cho lần thử sau?", "Ghi lại: đã thử gì, ra bao nhiêu, lệch bao nhiêu.", "Lần sau chỉ đổi một thứ để thấy rõ tác động."],
        "Mỗi lần thử tạo bằng chứng cho lần điều chỉnh tiếp theo.", "Chiến lược thử",
        { wrong: { "Thử thật nhanh": "Nhanh mà không ghi lại thì lần sau vẫn là đoán.", "Không cần kiểm tra": "Không kiểm tra thì không biết đã lệch bao nhiêu.", "Luôn bắt đầu bằng số lớn nhất": "Bắt đầu từ đâu không quan trọng bằng việc học được gì sau mỗi lần thử." } }),
      num(`Thẻ A được ${priceA} điểm, thẻ B được ${priceB} điểm. Nếu thêm 1 thẻ A và bớt 1 thẻ B, tổng điểm tăng thêm bao nhiêu?`, priceA - priceB,
        ["Thêm một thẻ A thì tăng bao nhiêu, bớt một thẻ B thì giảm bao nhiêu?", `Tăng ${priceA} điểm rồi giảm ${priceB} điểm.`, `Tính ${priceA} − ${priceB}.`],
        `Thẻ A nhiều điểm hơn thẻ B nên tổng tăng ${priceA} − ${priceB} = ${priceA - priceB} điểm.`, "Điều chỉnh có kiểm soát",
        { steps: 2, wrong: { [priceA + priceB]: "Bớt thẻ B làm tổng GIẢM, nên phải trừ chứ không cộng.", [priceA]: `Con quên phần giảm ${priceB} điểm do bớt một thẻ B.` } }),
      byBand(band,
        num(`Thẻ A được ${priceA} điểm. Thêm 1 thẻ A vào phương án thì tổng tăng bao nhiêu điểm?`, priceA,
          ["Một thẻ A đáng bao nhiêu điểm?", `Tổng mới = tổng cũ + điểm của một thẻ A.`, "Phần tăng thêm chính là điểm của thẻ vừa thêm."],
          `Thêm một thẻ A là thêm ${priceA} điểm.`, "Chuyển giao",
          { wrong: { 1: "Thêm một THẺ, nhưng mỗi thẻ A có nhiều điểm.", [priceB]: "Đây là điểm của thẻ B." } }),
        pick(`Phương án ${plan} đạt ${target} điểm. Mục tiêu mới là ${target + priceA} điểm. Cách sửa nhanh nhất là gì?`, "Thêm 1 thẻ A", ["Thêm 1 thẻ A", "Bớt 1 thẻ A", "Thêm 1 thẻ B", "Giữ nguyên"],
          ["Mục tiêu mới hơn mục tiêu cũ bao nhiêu điểm?", `Cần thêm ${target + priceA} − ${target} = ${priceA} điểm.`, "Loại thẻ nào có đúng số điểm cần thêm?"],
          `Cần thêm ${priceA} điểm, đúng bằng một thẻ A.`, "Chuyển giao",
          { steps: 2, wrong: { "Bớt 1 thẻ A": "Bớt thẻ thì tổng giảm, trong khi mục tiêu tăng.", "Thêm 1 thẻ B": `Thẻ B chỉ thêm ${priceB} điểm, chưa đủ ${priceA} điểm.`, "Giữ nguyên": "Mục tiêu đã tăng nên phải thêm điểm." } }),
        pick(`Phương án ${plan} đạt ${target} điểm (thẻ A ${priceA} điểm, thẻ B ${priceB} điểm). Mục tiêu mới là ${target + 2 * priceA - priceB} điểm. Cách sửa nào đúng?`, twoMoves, [twoMoves, "Thêm 1 thẻ A", "Thêm 2 thẻ A", "Bớt 1 thẻ B"],
          ["Mục tiêu mới hơn mục tiêu cũ bao nhiêu điểm?", `Cần thêm ${2 * priceA - priceB} điểm. Một thẻ A thêm ${priceA}; hai thẻ A thêm ${2 * priceA}.`, "Tính phần tăng của từng cách sửa rồi so với số điểm cần thêm."],
          `Thêm 2 thẻ A thì tăng ${2 * priceA} điểm, bớt 1 thẻ B thì giảm ${priceB} điểm: tổng tăng đúng ${2 * priceA - priceB} điểm.`, "Chuyển giao",
          { steps: 3, wrong: { "Thêm 1 thẻ A": `Chỉ tăng ${priceA} điểm, chưa đủ ${2 * priceA - priceB} điểm.`, "Thêm 2 thẻ A": `Tăng ${2 * priceA} điểm, vượt quá ${priceB} điểm.`, "Bớt 1 thẻ B": "Bớt thẻ thì tổng giảm, trong khi mục tiêu tăng." } }),
      ),
    ];
  }

  const total = easy ? 5 + mod(v, 4) : 10 + mod(v, 8); const digits = 3 + mod(v, 4); const digitSum = 5 + mod(v, 4);
  const sweep = "Cho một đại lượng chạy qua mọi giá trị có thể theo thứ tự";
  return [
    num(`Tìm mọi cặp số tự nhiên lớn hơn 0 có tổng ${total}. Không phân biệt thứ tự, có bao nhiêu cặp?`, Math.floor(total / 2),
      ["Nên bắt đầu liệt kê từ cặp nào?", `1 + ${total - 1}, 2 + ${total - 2}, …`, "Dừng khi số thứ nhất sắp lớn hơn số thứ hai, rồi đếm các cặp."],
      `Số thứ nhất chạy từ 1 đến ${Math.floor(total / 2)}: có ${Math.floor(total / 2)} cặp.`, "Liệt kê đầy đủ",
      { steps: 2, wrong: { [total - 1]: "Con đếm cả các cặp đổi chỗ. Đề không phân biệt thứ tự.", [total]: "Số 0 không được dùng." } }),
    pick("Làm sao chứng minh danh sách nghiệm không bị thiếu?", sweep, [sweep, "Nhìn danh sách thấy đủ", "Hỏi một người bạn", "Chỉ kiểm tra nghiệm đầu"],
      ["Điều gì bảo đảm không có trường hợp nào bị bỏ qua?", "Nếu số thứ nhất lần lượt là 1, 2, 3, … thì không giá trị nào bị nhảy qua.", "Cách nào mô tả việc quét lần lượt như vậy?"],
      "Quét toàn bộ phạm vi theo thứ tự là bằng chứng không bỏ sót.", "Chứng minh đầy đủ",
      { wrong: { "Nhìn danh sách thấy đủ": "“Thấy đủ” là cảm giác, chưa phải bằng chứng.", "Hỏi một người bạn": "Bạn cũng có thể sót. Cần một cách quét có thứ tự.", "Chỉ kiểm tra nghiệm đầu": "Nghiệm đầu đúng không cho biết các nghiệm sau có đủ không." } }),
    num(`Có bao nhiêu số chẵn lớn hơn 0 và nhỏ hơn ${2 * total}?`, total - 1,
      ["Số chẵn đầu tiên và số chẵn cuối cùng trong khoảng là số nào?", `2, 4, 6, …, ${2 * total - 2}. Chia mỗi số cho 2 được 1, 2, 3, …`, `Số cuối ${2 * total - 2} ứng với số thứ mấy?`],
      `Các số 2, 4, …, ${2 * total - 2} ứng với 1, 2, …, ${total - 1}: có ${total - 1} số.`, "Đếm theo quy tắc",
      { steps: 2, wrong: { [total]: `${2 * total} không nhỏ hơn chính nó, nên không được tính.`, [2 * total - 2]: "Đây là số chẵn lớn nhất, chưa phải số lượng các số chẵn." } }),
    num(`Một mật mã gồm hai chữ số khác nhau chọn từ 1, 2, …, ${digits}. Có bao nhiêu mật mã?`, digits * (digits - 1),
      ["Chọn xong chữ số thứ nhất, còn mấy lựa chọn cho chữ số thứ hai?", `Chữ số đầu: ${digits} cách. Chữ số sau phải khác chữ số đầu: ${digits - 1} cách.`, `Tính ${digits} × ${digits - 1}.`],
      `${digits} × ${digits - 1} = ${digits * (digits - 1)} mật mã.`, "Đếm không sót",
      { steps: 2, wrong: { [digits * digits]: "Hai chữ số phải KHÁC nhau, nên chữ số thứ hai ít hơn một lựa chọn.", [digits + digits - 1]: "Mỗi chữ số đầu ghép với mọi chữ số sau: nhân chứ không cộng." } }),
    byBand(band,
      num(`Có bao nhiêu số chẵn từ 2 đến ${2 * total} (tính cả hai đầu)?`, total,
        ["Chia mỗi số chẵn cho 2 thì được dãy số nào?", `2, 4, …, ${2 * total} ứng với 1, 2, …, ${total}.`, "Đếm các số trong dãy vừa tìm."],
        `Ứng với 1, 2, …, ${total}: có ${total} số.`, "Chuyển giao",
        { wrong: { [2 * total]: "Đây là số chẵn lớn nhất, chưa phải số lượng.", [total - 1]: "Lần này tính cả hai đầu." } }),
      num(`Tìm số cặp (x, y) số tự nhiên (được phép bằng 0) thỏa x + y = ${total + 3}.`, total + 4,
        ["x có thể nhỏ nhất là bao nhiêu và lớn nhất là bao nhiêu?", `x chạy từ 0 đến ${total + 3}; mỗi x có đúng một y.`, `Đếm các số từ 0 đến ${total + 3} (nhớ tính cả số 0).`],
        `x nhận các giá trị 0, 1, …, ${total + 3}: có ${total + 4} cặp.`, "Chuyển giao chứng minh",
        { steps: 2, wrong: { [total + 3]: "Con quên trường hợp x = 0.", [total + 2]: "Ở đây được phép dùng số 0 cho cả x và y." } }),
      num(`Có bao nhiêu số có hai chữ số mà tổng hai chữ số bằng ${digitSum}?`, digitSum,
        ["Chữ số hàng chục có thể là những số nào?", `Hàng chục từ 1 đến ${digitSum}; hàng đơn vị là phần còn lại (có thể là 0).`, "Mỗi chữ số hàng chục cho đúng một số: đếm xem có bao nhiêu chữ số hàng chục dùng được."],
        `Hàng chục là 1, 2, …, ${digitSum}: có ${digitSum} số (từ 1${digitSum - 1} đến ${digitSum}0).`, "Chuyển giao chứng minh",
        { steps: 3, wrong: { [digitSum + 1]: "Hàng chục không thể là 0, vì khi đó không còn là số có hai chữ số.", [digitSum - 1]: `Con quên số ${digitSum}0: hàng đơn vị được phép là 0.` } }),
    ),
  ];
}
