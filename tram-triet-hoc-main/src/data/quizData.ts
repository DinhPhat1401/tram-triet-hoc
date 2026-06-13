export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const PHILOSOPHY_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "Vấn đề cơ bản của triết học là gì?",
    options: [
      "Mối quan hệ giữa tư duy và tồn tại",
      "Mối quan hệ giữa tự nhiên và xã hội",
      "Mối quan hệ giữa vật chất và vận động",
      "Mối quan hệ giữa con người và thế giới xung quanh"
    ],
    correctAnswerIndex: 0,
    explanation: "Theo Ph.Ăngghen, vấn đề cơ bản lớn của mọi triết học, đặc biệt là của triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại (ý thức và vật chất)."
  },
  {
    id: 2,
    question: "Câu nói: 'Không ai tắm hai lần trên cùng một dòng sông' là của triết gia nào?",
    options: ["Socrates", "Heraclitus", "Plato", "Aristotle"],
    correctAnswerIndex: 1,
    explanation: "Đây là luận điểm nổi tiếng của Heraclitus về sự vận động và biến đổi không ngừng của thế giới vật chất."
  },
  {
    id: 3,
    question: "Theo quan điểm của Chủ nghĩa Mác - Lênin, nguồn gốc tự nhiên của ý thức là gì?",
    options: [
      "Bộ óc người và thế giới khách quan",
      "Lao động và ngôn ngữ",
      "Chỉ có lao động",
      "Bộ óc người và ngôn ngữ"
    ],
    correctAnswerIndex: 0,
    explanation: "Nguồn gốc tự nhiên của ý thức gồm bộ óc con người cùng với thế giới khách quan tác động lên bộ óc."
  },
  {
    id: 4,
    question: "Ai là tác giả của câu nói nổi tiếng 'Tôi tư duy, nên tôi tồn tại'?",
    options: ["Immanuel Kant", "Karl Marx", "René Descartes", "Socrates"],
    correctAnswerIndex: 2,
    explanation: "René Descartes với mệnh đề 'Cogito, ergo sum' đã đặt nền móng cho triết học phương Tây cận đại."
  },
  {
    id: 5,
    question: "Theo V.I. Lênin, vật chất là gì?",
    options: [
      "Một dạng tồn tại cụ thể",
      "Một phạm trù triết học dùng để chỉ thực tại khách quan",
      "Sự kết hợp của các hạt cơ bản",
      "Ý niệm tuyệt đối tha hóa"
    ],
    correctAnswerIndex: 1,
    explanation: "Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác..."
  },
  {
    id: 6,
    question: "Có bao nhiêu quy luật cơ bản của phép biện chứng duy vật?",
    options: ["2", "3", "4", "5"],
    correctAnswerIndex: 1,
    explanation: "Ba quy luật cơ bản: Quy luật lượng - chất, Quy luật mâu thuẫn, và Quy luật phủ định của phủ định."
  },
  {
    id: 7,
    question: "Hình thức vận động cao nhất theo Ph.Ăngghen là gì?",
    options: ["Vận động cơ học", "Vận động sinh học", "Vận động xã hội", "Vận động vật lý"],
    correctAnswerIndex: 2,
    explanation: "Vận động xã hội là hình thức vận động cao nhất và phức tạp nhất, đặc trưng bởi hoạt động thực tiễn của con người."
  },
  {
    id: 8,
    question: "Khái niệm nào dùng để chỉ những sự vật, hiện tượng có sự giống nhau về bản chất?",
    options: ["Cái chung", "Cái riêng", "Cái đơn nhất", "Cái ngẫu nhiên"],
    correctAnswerIndex: 0,
    explanation: "Cái chung là phạm trù triết học dùng để chỉ những mặt, những thuộc tính giống nhau tồn tại ở nhiều sự vật, hiện tượng."
  },
  {
    id: 9,
    question: "Phạm trù 'Chất' trong quy luật Lượng - Chất có nghĩa là gì?",
    options: [
      "Khối lượng của sự vật",
      "Thuộc tính cơ bản làm cho sự vật là nó chứ không phải là cái khác",
      "Giá trị kinh tế của sự vật",
      "Sự biểu hiện ra bên ngoài của sự vật"
    ],
    correctAnswerIndex: 1,
    explanation: "Chất là phạm trù triết học chỉ tính quy định khách quan vốn có của sự vật, là sự thống nhất hữu cơ các thuộc tính làm cho sự vật là nó."
  },
  {
    id: 10,
    question: "Theo phép biện chứng duy vật, phủ định biện chứng có đặc trưng cơ bản nào?",
    options: [
      "Tính khách quan và tính kế thừa",
      "Tính chấm dứt và tính bảo thủ",
      "Tính lặp lại và tính ngẫu nhiên",
      "Tính chủ quan và tính đột biến"
    ],
    correctAnswerIndex: 0,
    explanation: "Phủ định biện chứng mang tính khách quan và tính kế thừa, tạo điều kiện cho sự phát triển tiếp theo."
  },
  {
    id: 11,
    question: "Nguyên lý về sự phát triển trong phép biện chứng duy vật khẳng định điều gì?",
    options: [
      "Mọi sự vật đều đứng im",
      "Mọi sự vật đều vận động theo vòng tròn tuần hoàn",
      "Mọi sự vật đều vận động theo khuynh hướng đi lên",
      "Mọi sự vật đều vận động theo khuynh hướng đi xuống"
    ],
    correctAnswerIndex: 2,
    explanation: "Sự phát triển là quá trình vận động theo khuynh hướng đi lên, từ thấp đến cao, từ đơn giản đến phức tạp, từ kém hoàn thiện đến hoàn thiện hơn."
  },
  {
    id: 12,
    question: "Mâu thuẫn biện chứng là gì?",
    options: [
      "Là sự xung đột tiêu cực dẫn đến phá hủy sự vật",
      "Là sự liên kết của các mặt hoàn toàn giống nhau",
      "Là sự thống nhất và đấu tranh của các mặt đối lập",
      "Là sự khác biệt ngẫu nhiên không có tính quy luật"
    ],
    correctAnswerIndex: 2,
    explanation: "Mâu thuẫn biện chứng là khái niệm dùng để chỉ sự liên hệ, tác động qua lại, vừa thống nhất vừa đấu tranh của các mặt đối lập."
  },
  {
    id: 13,
    question: "Thực tiễn là gì?",
    options: [
      "Toàn bộ hoạt động tinh thần của con người",
      "Hoạt động vật chất có mục đích mang tính lịch sử - xã hội của con người",
      "Hoạt động sinh lý tự nhiên của con người",
      "Sự suy ngẫm lý luận về thế giới"
    ],
    correctAnswerIndex: 1,
    explanation: "Thực tiễn là toàn bộ những hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người nhằm cải tạo tự nhiên và xã hội."
  },
  {
    id: 14,
    question: "Chân lý là gì?",
    options: [
      "Những niềm tin cá nhân",
      "Những tri thức phù hợp với khách quan và được thực tiễn kiểm nghiệm",
      "Những luận điểm được nhiều người đồng tình",
      "Những quy luật tự nhiên chưa được khám phá"
    ],
    correctAnswerIndex: 1,
    explanation: "Chân lý là tri thức phù hợp với hiện thực khách quan và được thực tiễn kiểm nghiệm, xác nhận."
  },
  {
    id: 15,
    question: "Tiền đề xuất phát của chủ nghĩa duy vật lịch sử là gì?",
    options: [
      "Con người hiện thực sống và sản xuất ra của cải vật chất",
      "Tư tưởng và nhận thức của con người",
      "Các điều kiện địa lý và môi trường tự nhiên",
      "Nhà nước và pháp luật"
    ],
    correctAnswerIndex: 0,
    explanation: "Chủ nghĩa duy vật lịch sử xuất phát từ con người hiện thực, con người bằng hoạt động thực tiễn sản xuất ra của cải vật chất."
  },
  {
    id: 16,
    question: "Theo Mác, bản chất con người là gì?",
    options: [
      "Là một động vật có lý trí",
      "Là tổng hòa các quan hệ xã hội",
      "Là một thực thể sinh học tiến hóa",
      "Là sản phẩm của đấng sáng tạo"
    ],
    correctAnswerIndex: 1,
    explanation: "Trong tính hiện thực của nó, bản chất con người là tổng hòa những quan hệ xã hội."
  },
  {
    id: 17,
    question: "Quy luật nào vạch ra NGUỒN GỐC, ĐỘNG LỰC của sự vận động và phát triển?",
    options: [
      "Quy luật chuyển hóa từ những sự thay đổi về lượng thành những sự thay đổi về chất",
      "Quy luật thống nhất và đấu tranh của các mặt đối lập",
      "Quy luật phủ định của phủ định",
      "Quy luật giá trị"
    ],
    correctAnswerIndex: 1,
    explanation: "Quy luật mâu thuẫn (thống nhất và đấu tranh của các mặt đối lập) chỉ ra nguồn gốc, động lực bên trong của sự phát triển."
  },
  {
    id: 18,
    question: "Lực lượng sản xuất bao gồm những yếu tố nào?",
    options: [
      "Tư liệu sản xuất và Quan hệ sản xuất",
      "Người lao động và Tư liệu sản xuất",
      "Công cụ lao động và Đối tượng lao động",
      "Cơ sở hạ tầng và Kiến trúc thượng tầng"
    ],
    correctAnswerIndex: 1,
    explanation: "Lực lượng sản xuất là sự thống nhất hữu cơ giữa Người lao động (với kỹ năng, tri thức) và Tư liệu sản xuất (đặc biệt là công cụ lao động)."
  }
];
