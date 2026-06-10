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
  }
];
