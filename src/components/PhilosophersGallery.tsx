import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, BookOpen, Quote, Shield, ExternalLink, Sparkles, Copy, Check } from "lucide-react";

export interface Philosopher {
  id: string;
  name: string;
  vietnameseName: string;
  birthDeath: string;
  epoch: "marxist" | "antique" | "classical";
  epochLabel: string;
  portraitUrl: string;
  shortBio: string;
  coreThoughts: string[];
  keyQuote: string;
  quoteContext?: string;
  famousWorks: {
    title: string;
    description: string;
    year?: string;
  }[];
  influence: string;
  connectedStationId?: number;
}

const PHILOSOPHERS_DATA: Philosopher[] = [
  {
    id: "marx",
    name: "Karl Marx",
    vietnameseName: "Các Mác",
    birthDeath: "1818 - 1883",
    epoch: "marxist",
    epochLabel: "Triết học Mác - Lênin",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDx-iEZ0zw_il2_En3rUvMFWYnYCszcVhxkg&s",
    shortBio: "Nhà triết học, kinh tế học, xã hội học và nhà cách mạng lỗi lạc người Đức. Ông cùng Friedrich Engels sáng lập nên Chủ nghĩa duy vật biện chứng và Chủ nghĩa duy vật lịch sử, tạo nên bước ngoặt vĩ đại thay đổi căn bản tư duy triết học nhân loại.",
    coreThoughts: [
      "Chủ nghĩa duy vật biện chứng: Sự thống nhất biện chứng giữa vật chất và ý thức, trong đó vật chất quyết định ý thức phản ánh thế giới khách quan quan một cách sáng tạo.",
      "Chủ nghĩa duy vật lịch sử: Nhận diện quy luật vận động của lịch sử dựa trên mâu thuẫn giữa lực lượng sản xuất xã hội phát triển và quan hệ sản xuất lỗi thời.",
      "Học thuyết Giá trị thặng dư & Sứ mệnh lịch sử của giai cấp công nhân: Giải thích bản chất bóc lột của chủ nghĩa tư bản và vạch xuất hạt nhân cách mạng tiến lên chủ nghĩa cộng sản."
    ],
    keyQuote: "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới.",
    quoteContext: "Luận đề thứ 11 về Feuerbach",
    famousWorks: [
      {
        title: "Tuyên ngôn của Đảng Cộng sản",
        description: "Viết chung với Engels, văn kiện lý luận chính trị đặt nền móng phong trào cách mạng.",
        year: "1848"
      },
      {
        title: "Bộ Tư bản (Das Kapital)",
        description: "Kiệt tác luận giải sâu sắc nhất về bản chất của phương thức sản xuất tư bản và quy luật kinh tế đi kèm.",
        year: "1867"
      }
    ],
    influence: "Đặt nền móng lý luận cho toàn bộ phong trào chủ nghĩa xã hội khoa học trên toàn thế giới, cải tạo căn bản xã hội loài người trong thế kỷ XX.",
    connectedStationId: 1
  },
  {
    id: "engels",
    name: "Friedrich Engels",
    vietnameseName: "Phờ-ri-đrích Ăng-ghen",
    birthDeath: "1820 - 1895",
    epoch: "marxist",
    epochLabel: "Triết học Mác - Lênin",
    portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Friedrich_Engels%2C_c._1860_%28cropped%29.jpg/250px-Friedrich_Engels%2C_c._1860_%28cropped%29.jpg",
    shortBio: "Nhà triết học lớn người Đức, người bạn tri kỷ, đồng chí vĩ đại nhất của Các Mác. Engels đóng góp to lớn vào việc hệ thống hóa chủ nghĩa duy vật biện chứng thông qua việc tổng hợp tri thức khoa học tự nhiên đương thời.",
    coreThoughts: [
      "Phạm trù vấn đề cơ bản lớn của triết học: Định nghĩa rạch ròi mối quan hệ giữa tư duy và tồn tại, phân chia triết học thành hai phái chính là Duy vật và Duy tâm.",
      "Ba quy luật biện chứng duy vật: Quy luật lượng - chất; Quy luật thống nhất và đấu tranh của các mặt đối lập; Quy luật phủ định của phủ định.",
      "Vai trò lao động chuyển biến vượn thành người: Học thuyết độc đáo chứng minh lao động tạo nên ngôn ngữ, phát triển não bộ và kiến tạo xã hội loài người."
    ],
    keyQuote: "Càng đi sâu tìm hiểu thế giới, ta càng nhận thấy mọi sự vật không phải là những khối cố định khô khan mà là một quá trình liên tục biến đổi không ngừng.",
    quoteContext: "Chống Dühring",
    famousWorks: [
      {
        title: "Phép biện chứng của Tự nhiên",
        description: "Tác phẩm phân tích phép biện chứng khách quan tuần hoàn trong tự nhiên vũ trụ.",
        year: "1883"
      },
      {
        title: "Nguồn gốc của Gia đình, Tư hữu và Nhà nước",
        description: "Luận giải sự xuất hiện của các hình thái xã hội dựa trên sự phân công lao động và sự tích lũy của cải vật chất.",
        year: "1884"
      }
    ],
    influence: "Bảo vệ, truyền bá rực rỡ học thuyết Mác sau khi Mác qua đời và hệ thống hóa xuất sắc các quy luật cơ bản của phép biện chứng tự nhiên.",
    connectedStationId: 2
  },
  {
    id: "lenin",
    name: "Vladimir Ilyich Lenin",
    vietnameseName: "V.I. Lê-nin",
    birthDeath: "1870 - 1924",
    epoch: "marxist",
    epochLabel: "Triết học Mác - Lênin",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQubjEAobczJywnFKGFeASTbcmt0EB0zrRvA&s",
    shortBio: "Lãnh tụ vĩ đại của phong trào cách mạng vô sản thế giới, người sáng lập Nhà nước Xô-viết đầu tiên trên thế giới. Ông bảo vệ kiên cường di sản của Mác-Engels trước các khuynh hướng xét lại và đưa triết học Mác sang một giai đoạn phát triển mới.",
    coreThoughts: [
      "Định nghĩa kinh điển về Vật chất: 'Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác'.",
      "Mối liên hệ giữa triết học biện chứng và vật lý học hiện đại: Khái quát cuộc cách mạng khoa học tự nhiên đầu thế kỷ XX, chỉ ra 'vật chất không biến mất mà chỉ giới hạn cũ trong thế giới quan biến mất'.",
      "Lý luận về Cách mạng vô sản và Nhà nước: Phác thảo cách thức tổ chức chuyên chính vô sản và xây dựng chủ nghĩa xã hội ở các nước thuộc địa, nửa thuộc địa."
    ],
    keyQuote: "Không có lý luận cách mạng thì cũng không thể có phong trào cách mạng.",
    quoteContext: "Làm gì?",
    famousWorks: [
      {
        title: "Chủ nghĩa duy vật và chủ nghĩa kinh nghiệm phê phán",
        description: "Tác phẩm triết học cốt lõi tiêu diệt chủ nghĩa duy tâm chủ quan núp bóng khoa học.",
        year: "1909"
      },
      {
        title: "Bút ký triết học",
        description: "Tập hợp những ghi chép sâu sắc nhất của Lenin khi tiếp cận triết học Hegel và phép biện chứng.",
        year: "1914"
      }
    ],
    influence: "Đưa chủ nghĩa Mác từ lý thuyết bước thẳng vào thực tiễn lịch sử bằng thắng lợi rực rỡ của Cách mạng Tháng Mười Nga năm 1917 vĩ đại.",
    connectedStationId: 3
  },
  {
    id: "socrates",
    name: "Socrates",
    vietnameseName: "Sô-crát",
    birthDeath: "~470 - 399 TCN",
    epoch: "antique",
    epochLabel: "Triết học Hy Lạp Cổ đại",
    portraitUrl: "https://cdn.britannica.com/69/75569-050-7AB67C4B/herm-Socrates-half-original-Greek-Capitoline-Museums.jpg",
    shortBio: "Bậc thầy lập thuyết tiên phong của triết học phương Tây thế giới cổ đại. Ông không viết bất kỳ cuốn sách nào mà chỉ thảo luận trực tiếp ngoài quảng trường Athens, kiến tạo nên phương pháp hộ sản triết học trứ danh của nhân loại.",
    coreThoughts: [
      "Phương pháp vấn đáp Socrates (Socratic Method): Đặt liên tục câu hỏi phản biện để bóc tách sự tự mãn giả hiệu, dẫn dắt đối phương tự nhìn thấy chân lý.",
      "Nhận diện bản thân: Chân lý bắt đầu bằng sự thú nhận 'Tôi chỉ biết một điều duy nhất là tôi không biết gì cả'.",
      "Đạo đức học thuần khiết: Liên kết chặt chẽ trí tuệ với đức hạnh, cho rằng không một ai làm việc xấu chỉ vì tự nguyện mà đều xuất phát từ sự thiếu hiểu biết chân lý."
    ],
    keyQuote: "Cuộc đời không được phản tỉnh suy xét thì không đáng sống.",
    quoteContext: "Sự bào chữa của Socrates",
    famousWorks: [
      {
        title: "Các đối thoại Socrates",
        description: "Được ghi chép lại một cách chân thực nhất thông qua ngòi bút học trò xuất chúng của ông là Plato.",
        year: "Cổ đại"
      }
    ],
    influence: "Chuyển dịch trọng tâm triết học Hy Lạp cổ đại từ tìm kiếm nguyên tố thiên nhiên sơ khai sang khám phá thế giới nội tâm tinh thần con người.",
    connectedStationId: 1
  },
  {
    id: "plato",
    name: "Plato",
    vietnameseName: "Pla-tôn",
    birthDeath: "~427 - 347 TCN",
    epoch: "antique",
    epochLabel: "Triết học Hy Lạp Cổ đại",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS36VwVAdCsbU90XxGFC4Ud3e3oYWN4sgcifQ&s",
    shortBio: "Học trò xuất sắc bậc nhất của Socrates, nhà triết học duy tâm khách quan vĩ đại bậc nhất thế giới cổ đại. Ông sáng lập Hàn lâm viện Athens (Academy), trường đại học đầu tiên của thế giới phương Tây.",
    coreThoughts: [
      "Thuyết ý niệm (Theory of Forms): Thế giới cảm giác vật chất ta nhìn thấy chỉ là cái bóng phản chiếu méo mó của thế giới Ý niệm hoàn hảo bất biến nằm ngoài không gian.",
      "Huyền thoại Hang động (Allegory of the Cave): Mô tả hành trình thức tỉnh lý tính gian khổ vượt ra khỏi bóng tối dư luận để nhìn thấy ánh sáng chân lý mặt trời.",
      "Nhà nước lý tưởng (The Republic): Thiết kế một mô hình xã hội công bằng tối thượng cai trị bởi các nhà Hiền triết (Vua Triết học) giàu tình yêu trí tuệ vô tư lợi."
    ],
    keyQuote: "Những chiếc bóng trên vách đá của hang động mờ ảo là thực tại duy nhất của những gã tù nhân bị xích chân tay.",
    quoteContext: "Tác phẩm Cộng hòa",
    famousWorks: [
      {
        title: "Cộng hòa (The Republic)",
        description: "Tác phẩm đồ sộ định hình toàn bộ chính trị học, đạo đức học và siêu hình học phương Tây.",
        year: "~375 TCN"
      },
      {
        title: "Yến tiệc (Symposium)",
        description: "Tập hợp các bài diễn thuyết giàu thi vị bàn về bản chất cốt tủy của Tình yêu tuyệt mỹ.",
        year: "~380 TCN"
      }
    ],
    influence: "Mọi nỗ lực tư duy của phương Tây sau đó đều bị gọi là 'những lời chú thích chân trang kéo dài cho Plato'."
  },
  {
    id: "aristotle",
    name: "Aristotle",
    vietnameseName: "A-ri-xtốt",
    birthDeath: "384 - 322 TCN",
    epoch: "antique",
    epochLabel: "Triết học Hy Lạp Cổ đại",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScTcutzLzJBaaTSpYxho0l3AEQMxyZwaY0SQ&s",
    shortBio: "Nhà bác học, triết học bách khoa xuất sắc nhất toàn bộ lịch sử nhân loại thời cổ đại, nghiên cứu sinh tại Hàn lâm viện Plato suốt 20 năm. Ông là gia sư lỗi lạc định hình dũng khí chí hướng cho Hoàng đế Alexander Đại đế.",
    coreThoughts: [
      "Logic học hình thức: Phát minh tam đoạn luận (syllogism) làm công cụ vận hành lập luận đúng đắn chuẩn xác tuyệt đối.",
      "Lý thuyết Bốn nguyên nhân: Để hiểu thực thể cần hiểu Nguyên nhân vật chất, Nguyên nhân hình thức, Nguyên nhân tác động, và Nguyên nhân mục đích tối thượng.",
      "Con người là động vật chính trị (Zoon Politikon): Xác khẳng tính chất bản thiện xã hội sâu sắc của loài người, chỉ có thể mưu cầu hạnh phúc bền vững trong lòng một quốc gia chính danh."
    ],
    keyQuote: "Plato là quý nhân tôn kính của tôi, nhưng Chân lý là người tôi tôn kính nhất.",
    quoteContext: "Đạo đức học Nicomachean",
    famousWorks: [
      {
        title: "Siêu hình học (Metaphysics)",
        description: "Nghiên cứu về Bản thể luận hàng đầu, xác định sự tồn tại bản thể tự nhiên bên dưới vật lý học.",
        year: "Cổ đại"
      },
      {
        title: "Chính trị học (Politics)",
        description: "Đi sâu phân tích sự ổn định chính trị, đặc điểm của các kiểu thể chế từ dân chủ đến độc tài.",
        year: "Cổ đại"
      }
    ],
    influence: "Chi phối sâu sắc nền khoa học lý tính và thần học kinh viện châu Âu thời trung cổ suốt hàng ngàn năm thế hệ nối tiếp."
  },
  {
    id: "descartes",
    name: "René Descartes",
    vietnameseName: "Rơ-nê Đê-các-tơ",
    birthDeath: "1596 - 1650",
    epoch: "classical",
    epochLabel: "Triết học Duy lý Thăng hoa",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvSpdmilAKBOTTTu3vXNykeqtNxSqkQ79DeQ&s",
    shortBio: "Nhà toán học kiêm triết học cha đẻ của triết học phương Tây cận đại. Ông tách độc lập khỏi hệ thống giáo điều kinh viện bằng cách đặt Hoài nghi làm cơ sở đầu tiên tiếp cận thế giới tự nhiên thực nghiệm khoa học.",
    coreThoughts: [
      "Hoài nghi phương pháp luận (Methodological Doubt): Hoài nghi toàn bộ cảm xúc giác quan để đi tìm một chân lý bất biến không thể bị lay động.",
      "Công thức nhị phân Cogito: Phát hiện rằng ngay cả khi ta hoài nghi tất cả, ta không thể hoài nghi suy nghĩ của mình - Khẳng định sự tồn tại của Lý trí chủ thể.",
      "Chuyết nhị nguyên luận (Cartesian Dualism): Chia thế giới thành hai chất thể độc lập vận hành song phẳng: Thực chất tư duy (ý thức) và Thực chất mở rộng (vật chất)."
    ],
    keyQuote: "Tôi tư duy, nên tôi tồn tại. (Cogito, ergo sum)",
    quoteContext: "Phương pháp luận",
    famousWorks: [
      {
        title: "Phương pháp luận (Discourse on the Method)",
        description: "Sách trình bày con đường điều khiển lý trí và đi tìm kiếm chân lý trong các ngành khoa học.",
        year: "1637"
      },
      {
         title: "Suy ngẫm về Triết học Tiên khởi",
         description: "Chứng minh sự tồn tại của Linh hồn con người và Thiên Chúa bằng các dòng hoài nghi siêu hình học.",
         year: "1641"
      }
    ],
    influence: "Khai hỏa kỷ nguyên Khai sáng và cách mạng hóa toán học nhân loại bằng lập biên tọa độ Descartes kỳ tài."
  },
  {
    id: "kant",
    name: "Immanuel Kant",
    vietnameseName: "I-ma-nu-en Kan-tơ",
    birthDeath: "1724 - 1804",
    epoch: "classical",
    epochLabel: "Triết học Cổ điển Đức",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrihNB-bdk9g91xMVNjMhxgoyMqin00REgiA&s",
    shortBio: "Đại triết gia vĩ đại nhất của phong trào Khai sáng Đức thế kỷ XVIII. Ông thực hiện một cuộc cách mạng Kopernik trong triết học bằng việc hòa trộn xuất sắc hai trường phái Duy lý mộng mị và Duy thực nghiệm nông cạn.",
    coreThoughts: [
      "Thuyết tri thức phê phán: Tâm trí không thụ động nhận thế giới mà tích cực đóng vai trò xây dựng cách thức nhìn nhận dựa trên Không gian & Thời gian bản năng.",
      "Vật tự nó (Thing-in-itself): Phân chia thế giới thành Hiện tượng mắt thấy (Phenomena) và Bản chất chân thực nguyên bản (Noumena - Thứ ta không thể chạm tới trực tiếp).",
      "Mệnh lệnh tuyệt đối (Categorical Imperative): Quy tắc đạo đức tối ưu định đoạt: Hành động theo nguyên tắc mà bản thân có hy vọng trở thành chuẩn mực tự nhiên toàn cầu."
    ],
    keyQuote: "Hai thứ lấp đầy tâm trí tôi với sự kính sợ ngày càng tăng: bầu trời đầy sao lấp lánh trên đầu và luật đạo đức tôn nghiêm trong lòng.",
    quoteContext: "Phê phán Lý tính Thực hành",
    famousWorks: [
      {
        title: "Phê phán Lý tính Thuần túy",
        description: "Đặt lại ranh giới năng lực tư duy trí óc của loài người khi đối diện với siêu hình học vô bờ bến.",
        year: "1781"
      },
      {
        title: "Phê phán Lý tính Thực hành",
        description: "Trình lý thuyết đạo đức học đạo nghĩa, đặt nền tảng cho lương tâm hành động vô cầu lợi tự thân.",
        year: "1788"
      }
    ],
    influence: "Chấm dứt lối siêu hình học võ đoán, khánh thành kỷ nguyên huy hoàng rực rỡ kéo dài của Triết học Cổ điển Đức."
  },
  {
    id: "hegel",
    name: "Georg Wilhelm Friedrich Hegel",
    vietnameseName: "G.W.F. Hê-ghen",
    birthDeath: "1770 - 1831",
    epoch: "classical",
    epochLabel: "Triết học Cổ điển Đức",
    portraitUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBOCD4gVcOo87SFBzYpfWzjKlLax3-t-7mkA&s",
    shortBio: "Đỉnh cao chói bọi tinh hoa của duy tâm biện chứng Cổ điển Đức thế kỷ XIX. Ông xây dựng hệ thống bách khoa tri thức khổng lồ vĩ đại, nơi hiện thực lịch sử, tự nhiên và ý thức được coi là quá trình tự vận động vươn lên của Tinh thần tuyệt đối.",
    coreThoughts: [
      "Hệ thống phép biện chứng tinh vi vĩ đại: Coi sự phát triển thực hiện qua các bước 'Chính đề - Phản đề - Hợp đề', mâu thuẫn là nguồn động lực tự sinh của lịch sử loài người.",
      "Tinh thần Tuyệt đối (Absolute Spirit): Bản thể tối cao tự biểu đạt thông qua thế giới tự nhiên bên ngoài, lịch sử loài người, và sau cùng đạt tự nhận thức tuyệt đối trong Triết học nghệ thuật.",
      "Tha hóa tinh thần: Lịch sử là sự vận động tự giải thoát tự do tâm trí thoát khỏi vỏ bọc lưu chuyển vật chất."
    ],
    keyQuote: "Những gì có thật thì hợp lý, và những gì hợp lý thì có thật.",
    quoteContext: "Các nguyên lý của Triết học Pháp quyền",
    famousWorks: [
      {
        title: "Hiện tượng học Tinh thần (Phenomenology of Spirit)",
        description: "Hành trình thăng hoa rèn luyện ý thức từ sơ khai cảm tính vượt bậc đến Tri thức tuyệt đối.",
        year: "1807"
      },
      {
        title: "Khoa học Logic (Science of Logic)",
        description: "Trình bày cấu trúc cốt lõi hoạt động của thế giới lý tính và tư tưởng tuyệt mỹ nguyên bản.",
        year: "1812"
      }
    ],
    influence: "Phép biện chứng uyên bác cực kỳ sâu sắc của ông chính là chiếc hạt nhân thuần túy quý giá được Các Mác bóc gỡ lớp vỏ duy tâm cải tạo thành Phép Biện chứng duy vật tiến bộ.",
    connectedStationId: 2
  }
];

interface PhilosophersGalleryProps {
  onLearnStation?: (stationId: number) => void;
}

export default function PhilosophersGallery({ onLearnStation }: PhilosophersGalleryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "marxist" | "antique" | "classical">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search logic
  const filteredPhilosophers = PHILOSOPHERS_DATA.filter((p) => {
    const matchesTab = activeTab === "all" || p.epoch === activeTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.coreThoughts.some((thought) => thought.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.keyQuote.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCopyQuote = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section className="py-20 px-4 md:px-12 bg-neutral-50/50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3 text-amber-600 animate-spin" /> Thư viện Trực quan Triết học
            </span>
            <h2 id="portraits-title" className="font-serif text-3xl md:text-4xl text-primary font-bold">
              Chân Dung Các Nhà Triết Học Vĩ Đại
            </h2>
            <p className="font-sans text-neutral-600 text-xs md:text-sm leading-relaxed mt-2">
              Khám phá chân dung nghệ thuật lịch sử, tóm tắt tiểu sử, tư tưởng cách mạng cốt lõi cùng những phát ngôn bất hủ đã định hình dòng chảy tư duy của nhân loại và học thuyết Mác - Lênin.
            </p>
          </div>
          
          {/* SEARCH BOX */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Tìm triết gia, tư tưởng, câu nói..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-3.5 pl-10 pr-4 bg-white border border-neutral-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-primary transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* INTERACTIVE CATEGORY TAB FILTER PILLS */}
        <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b border-neutral-200/60">
          {[
            { id: "all", label: "Tất cả các thời kỳ" },
            { id: "marxist", label: "Học thuyết Mác - Lênin" },
            { id: "antique", label: "Hy Lạp Cổ đại" },
            { id: "classical", label: "Duy lý & Cổ điển Đức" }
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  active
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
                    : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-100 hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PHILOSOPHERS PORTRAITS GRID */}
        {filteredPhilosophers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPhilosophers.map((phil, idx) => (
                <motion.div
                  key={phil.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  onClick={() => setSelectedPhilosopher(phil)}
                  className="bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:translate-y-[-6px] transition-all duration-300 cursor-pointer pointer-events-auto flex flex-col justify-between group"
                >
                  <div className="relative">
                    {/* Portrait image with modern high contrast mask overlay */}
                    <div className="h-72 w-full overflow-hidden bg-neutral-100 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
                      <img
                        src={phil.portraitUrl}
                        alt={`Portait of ${phil.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top scale-100 group-hover:scale-105 transition-transform duration-700 select-none grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          // Fallback styled initials if public domains block external image loading
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement("div");
                            fallback.className = "absolute inset-0 flex items-center justify-center bg-primary text-amber-400 font-serif text-5xl font-bold";
                            fallback.innerText = phil.name.charAt(0);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                      
                      {/* Period Badge */}
                      <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[9px] font-bold bg-white/90 backdrop-blur-md text-primary tracking-wider uppercase border shadow-sm">
                        {phil.epochLabel}
                      </span>
                    </div>

                    {/* Meta Section */}
                    <div className="p-6 pb-2 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-serif text-xl font-bold text-primary group-hover:text-amber-700 transition-colors">
                          {phil.vietnameseName} <span className="font-sans text-xs font-normal text-neutral-400 block sm:inline">({phil.name})</span>
                        </h3>
                      </div>
                      <p className="text-[11px] font-mono font-bold text-amber-600 tracking-wider">
                        ⏳ {phil.birthDeath}
                      </p>
                      <p className="text-xs text-neutral-500 font-sans leading-relaxed line-clamp-3 pt-1">
                        {phil.shortBio}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action Card */}
                  <div className="p-6 pt-2 border-t border-neutral-100 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 group-hover:text-primary transition-colors">
                      📁 Bấm để xem chi tiết
                    </span>
                    <button className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl font-bold transition-all focus:outline-none flex items-center gap-1">
                      Chi tiết <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed text-center py-16 px-6 max-w-xl mx-auto">
            <div className="text-4xl text-neutral-300 mb-4">🔎</div>
            <h4 className="font-serif font-bold text-sm text-primary">Không tìm thấy triết gia phù hợp</h4>
            <p className="text-xs text-neutral-400 mt-2">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc lọc theo thời kỳ lịch sử khác xem sao nhé.
            </p>
          </div>
        )}

        {/* PREMIUM MODAL DETAIL DETAILED VIEW */}
        <AnimatePresence>
          {selectedPhilosopher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* BACKDROP ANIMATION */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhilosopher(null)}
                className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm"
              />

              {/* MODAL SHEET CONTENT */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl relative z-60 border border-neutral-200 grid grid-cols-1 md:grid-cols-12 pointer-events-auto"
              >
                {/* CLOSE FLOATING BUTTON */}
                <button
                  onClick={() => setSelectedPhilosopher(null)}
                  className="absolute top-4 right-4 z-50 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-full cursor-pointer transition-colors shadow-md focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* LEFT PORTRAIT PANEL */}
                <div className="md:col-span-5 bg-neutral-900 relative min-h-[300px] md:min-h-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/30 to-transparent opacity-90 z-10" />
                  <img
                    src={selectedPhilosopher.portraitUrl}
                    alt={selectedPhilosopher.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-85 select-none"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className = "absolute inset-0 flex items-center justify-center bg-primary text-amber-400 font-serif text-6xl font-bold";
                        fallback.innerText = selectedPhilosopher.name.charAt(0);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  
                  {/* Outer description overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-8 z-20 text-white space-y-2">
                    <span className="px-3 py-1 rounded-full text-[9px] font-bold bg-amber-500 text-neutral-950 uppercase tracking-widest inline-block">
                      {selectedPhilosopher.epochLabel}
                    </span>
                    <h3 className="font-serif text-3xl font-bold">
                      {selectedPhilosopher.vietnameseName}
                    </h3>
                    <p className="text-xs text-neutral-300 font-medium">Bản danh tiếng: {selectedPhilosopher.name}</p>
                    <p className="text-[11px] font-mono text-amber-300 font-bold tracking-wider">⏳ Thời kỳ: {selectedPhilosopher.birthDeath}</p>
                  </div>
                </div>

                {/* RIGHT INFOMATION CORE SHEET */}
                <div className="md:col-span-7 p-8 md:p-10 space-y-8 overflow-y-auto">
                  {/* QUOTE BANNER */}
                  <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-200/50 relative">
                    <Quote className="absolute top-4 left-4 w-12 h-12 text-amber-200/40 pointer-events-none" />
                    <blockquote className="font-serif italic text-base text-primary pl-8 leading-relaxed">
                      \"{selectedPhilosopher.keyQuote}\"
                    </blockquote>
                    {selectedPhilosopher.quoteContext && (
                      <cite className="block text-right text-[10px] font-sans font-bold uppercase text-neutral-400 tracking-wider mt-3 pl-8">
                        — Trích {selectedPhilosopher.quoteContext}
                      </cite>
                    )}
                    
                    {/* Copy quote interaction */}
                    <button
                      onClick={() => handleCopyQuote(selectedPhilosopher!.keyQuote, selectedPhilosopher!.id)}
                      className="absolute bottom-4 right-4 bg-white/70 hover:bg-white text-neutral-600 hover:text-primary p-1.5 rounded-lg border text-xs shadow-xs transition-all flex items-center gap-1 focus:outline-none cursor-pointer"
                      title="Sao chép câu nói"
                    >
                      {copiedId === selectedPhilosopher.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-[9px] text-green-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[9px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* DETAILED BIO */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" /> Về triết gia
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                      {selectedPhilosopher.shortBio}
                    </p>
                  </div>

                  {/* CORE THOUGHTS (Bullet point analysis) */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tư tưởng cách mạng & lý luận cốt lõi
                    </h4>
                    <ul className="space-y-3.5 select-text">
                      {selectedPhilosopher.coreThoughts.map((thought, i) => {
                        const [title, desc] = thought.split(":");
                        return (
                          <li key={i} className="flex gap-3 text-xs text-neutral-600 leading-relaxed font-sans items-start">
                            <span className="w-5 h-5 rounded-full bg-primary/5 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/10 flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <strong className="text-neutral-800 font-sans block mb-0.5">{title}</strong>
                              <span className="text-[11px] text-neutral-500">{desc}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* NOTABLE WORK */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" /> Tác phẩm kiệt tác tiêu biểu
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedPhilosopher.famousWorks.map((work, idx) => (
                        <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h5 className="font-serif text-sm font-bold text-primary flex items-center gap-1.5">
                              📙 {work.title}
                            </h5>
                            <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                              {work.description}
                            </p>
                          </div>
                          {work.year && (
                            <span className="text-[9px] font-mono bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-md font-bold flex-shrink-0">
                              {work.year}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SOCIAL INFLUENCE */}
                  <div className="bg-neutral-100 p-4 rounded-xl border">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                      Ảnh hưởng lịch sử vĩ đạo
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      {selectedPhilosopher.influence}
                    </p>
                  </div>

                  {/* ACTION CORRELATION */}
                  {selectedPhilosopher.connectedStationId && onLearnStation && (
                    <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-[11px] text-neutral-400 font-medium">
                        *Tri thức của triết gia này nằm trong chương trình học tại:
                      </p>
                      <button
                        onClick={() => {
                          setSelectedPhilosopher(null);
                          onLearnStation(selectedPhilosopher.connectedStationId!);
                        }}
                        className="bg-primary hover:bg-opacity-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        Học ngay Trạm {selectedPhilosopher.connectedStationId} <ExternalLink className="w-3.5 h-3.5 text-amber-200" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
