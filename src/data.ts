/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Station, Book, DiscussionPost } from "./types";

export const STATIONS_DATA: Station[] = [
  {
    id: 1,
    title: "Trạm 1: Khái luận về Triết học",
    description: "Triết học là gì, vấn đề cơ bản của triết học, và vai trò của triết học Mác - Lênin trong đời sống xã hội.",
    iconName: "HelpCircle",
    introduction: "Chào mừng bạn đến với Trạm 1. Tại đây, chúng ta sẽ bắt đầu hành trình tìm hiểu những câu hỏi cơ bản nhất: Triết học xuất hiện từ đâu? Thế giới quan là gì? Và tại sao triết học Mác - Lênin lại là một cuộc cách mạng trong lịch sử tư tưởng nhân loại.",
    lessons: [
      {
        id: "s1-l1",
        title: "Triết học và Nguồn gốc của Triết học",
        subtitle: "Khái niệm nền móng",
        summary: "Tìm hiểu sự ra đời của triết học thông qua hai nguồn gốc cơ bản: Nguồn gốc nhận thức và Nguồn gốc xã hội.",
        sections: [
          {
            heading: "1. Khái niệm Triết học là gì?",
            paragraphs: [
              "Triết học ra đời vào khoảng thế kỷ VIII đến thế kỷ VI trước Công nguyên tại các trung tâm văn minh cổ đại của nhân loại như Ấn Độ, Trung Hoa và Hy Lạp.",
              "Về mặt từ nguyên, ở Trung Quốc cổ đại, chữ 'Triết' (哲) có nghĩa là trí tuệ, sự hiểu biết sâu sắc về thế giới và con người. Ở Ấn Độ cổ đại, thuật ngữ Darshana mang ý nghĩa là chiêm ngưỡng, nhìn nhận dựa trên lý trí. Còn ở Hy Lạp cổ đại, thuật ngữ Philosophia dịch nghĩa là 'yêu mến sự thông thái' (love of wisdom).",
              "Theo định nghĩa của triết học Mác - Lênin, triết học là hệ thống quan điểm lý luận chung nhất của con người về thế giới, về bản thân con người và vị trí của con người trong thế giới đó."
            ]
          },
          {
            heading: "2. Hai nguồn gốc dẫn đến sự ra đời của Triết học",
            paragraphs: [
              "Nguồn gốc nhận thức: Triết học chỉ xuất hiện khi tư duy của con người đạt đến trình độ trừu tượng hóa, khái quát hóa cao. Con người không còn thỏa mãn với các câu chuyện huyền thoại hay thần thoại tôn giáo giải thích tự nhiên, mà muốn dùng lý tính của mình để đi tìm bản chất thật sự sau mọi hiện tượng.",
              "Nguồn gốc xã hội: Triết học ra đời khi lực lượng sản xuất xã hội phát triển, dẫn đến sự phân công lao động xã hội, đặc biệt là sự phân tách giữa lao động trí óc và lao động chân tay. Giai cấp tri thức xuất hiện, có thời gian để suy ngẫm, hệ thống hóa thế giới quan."
            ]
          }
        ]
      },
      {
        id: "s1-l2",
        title: "Vấn đề cơ bản của Triết học",
        subtitle: "Điểm mấu chốt phân định các trường phái",
        summary: "Hiểu rõ câu hỏi lớn nhất xuyên suốt lịch sử triết học: Mối quan hệ giữa tư duy và tồn tại, hay giữa ý thức và vật chất.",
        sections: [
          {
            heading: "1. Hai mặt của Vấn đề cơ bản",
            paragraphs: [
              "Theo Friedrich Engels: \"Vấn đề cơ bản lớn của mọi triết học, đặc biệt là của triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại\" (hay giữa tinh thần và tự nhiên, giữa ý thức và vật chất).",
              "Vấn đề này gồm hai mặt rõ rệt:",
              "Mặt thứ nhất (Mặt Bản thể luận): Giữa vật chất và ý thức, cái nào có trước, cái nào có sau? Cái nào quyết định cái nào? Quy định sự phân chia triết học thành Chủ nghĩa duy vật (vật chất quyết định ý thức) và Chủ nghĩa duy tâm (ý thức quyết định vật chất).",
              "Mặt thứ hai (Mặt Nhận thức luận): Con người có khả năng nhận thức được thế giới hay không? Quy định sự phân chia thành Thuyết khả tri (khẳng định con người nhận thức được bản chất thế giới) và Thuyết bất khả tri (phủ nhận khả năng nhận thức thế giới của con người)."
            ]
          },
          {
            heading: "2. Các hình thức của Chủ nghĩa Duy vật và Duy tâm",
            paragraphs: [
              "Chủ nghĩa duy vật đã trải qua ba hình thức phát triển chính: Chủ nghĩa duy vật chất phác cổ đại (ngây thơ nhưng đúng hướng), Chủ nghĩa duy vật siêu hình thế kỷ XVII - XVIII (coi thế giới như cỗ máy khổng lồ tĩnh tại) và Chủ nghĩa duy vật biện chứng (hình thức hoàn bị nhất do Marx và Engels sáng lập).",
              "Chủ nghĩa duy tâm gồm hai phái: Chủ nghĩa duy tâm chủ quan (phóng đại vai trò cảm giác cá nhân, ví dụ: 'vật là phức hợp của các cảm giác') và Chủ nghĩa duy tâm khách quan (cho rằng có một thực thể tinh thần tuyệt đối đi trước thế giới tự nhiên như 'Ý niệm tuyệt đối' của Hegel hay 'Trời' trong triết học Đông phương)."
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: "s1-q1",
        question: "Vấn đề cơ bản lớn nhất của mọi triết học là gì?",
        options: [
          "Mối quan hệ giữa giai cấp bóc lột và giai cấp bị bóc lột",
          "Mối quan hệ giữa tư duy và tồn tại (ý thức và vật chất)",
          "Nguồn gốc vũ trụ bắt đầu từ lửa, nước hay không khí",
          "Mối quan hệ giữa con người và xã hội công nghiệp"
        ],
        correctIndex: 1,
        explanation: "Theo Friedrich Engels, vấn đề cơ bản lớn của mọi triết học, đặc biệt là triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại (hay giữa ý thức và vật chất)."
      },
      {
        id: "s1-q2",
        question: "Triết học ra đời gắn liền với những nguồn gốc nào?",
        options: [
          "Nguồn gốc tự nhiên và nguồn gốc lịch sử",
          "Nguồn gốc sinh học và nguồn gốc ý chí",
          "Nguồn gốc nhận thức và nguồn gốc xã hội",
          "Nguồn gốc kinh tế và nguồn gốc tôn giáo"
        ],
        correctIndex: 2,
        explanation: "Triết học chỉ ra đời khi có đủ 2 nguồn gốc: Nguồn gốc nhận thức (tư duy đạt đến mức độ khái quát hóa cao) và Nguồn gốc xã hội (phân công lao động xã hội hình thành lao động trí óc và chân tay, xuất hiện giai cấp)."
      },
      {
        id: "s1-q3",
        question: "Về mặt từ nguyên học thế giới cổ đại, thuật ngữ 'Philosophia' ở Hy Lạp nghĩa là gì?",
        options: [
          "Sự chiêm ngưỡng chân lý khách quan",
          "Yêu mến sự thông thái",
          "Sự giải thoát khỏi khổ đau luân hồi",
          "Khoa học của các khoa học"
        ],
        correctIndex: 1,
        explanation: "Thuật ngữ 'Philosophia' của Hy Lạp cổ đại được cấu thành từ 'philo' (yêu mến) và 'sophia' (sự thông thái), nghĩa là 'Yêu mến sự thông thái'."
      },
      {
        id: "s1-q4",
        question: "Hình thức phát triển cao nhất của chủ nghĩa duy vật trong lịch sử là gì?",
        options: [
          "Chủ nghĩa duy vật chất phác cổ đại",
          "Chủ nghĩa duy vật siêu hình máy mọc",
          "Chủ nghĩa duy vật biện chứng",
          "Chủ nghĩa duy vật lịch sử thuần túy"
        ],
        correctIndex: 2,
        explanation: "Chủ nghĩa duy vật biện chứng do Marx và Engels sáng lập, Lênin phát triển, là hình thức khoa học và hoàn bị nhất của chủ nghĩa duy vật."
      },
      {
        id: "s1-q5",
        question: "Phái triết học nào cho rằng thế giới vật chất là kết quả của một thế lực tinh thần có trước khách quan?",
        options: [
          "Chủ nghĩa duy vật siêu hình",
          "Chủ nghĩa duy tâm khách quan",
          "Chủ nghĩa duy tâm chủ quan",
          "Thuyết Nhị nguyên luận biện chứng"
        ],
        correctIndex: 1,
        explanation: "Chủ nghĩa duy tâm khách quan thừa nhận một tinh thần có trước và sinh ra thế giới khách quan một cách độc lập khỏi con người (như 'Ý niệm tuyệt đối', 'Thần thánh')."
      },
      {
        id: "s1-q6",
        question: "Trường phái triết học nào bác bỏ khả năng nhận thức thế giới đầy đủ của con người?",
        options: [
          "Thuyết Khả tri (Gnosticism/Cognoscenti)",
          "Chủ nghĩa hoài nghi tuyệt đối",
          "Thuyết Bất khả tri (Agnosticism)",
          "Chủ nghĩa duy vật cổ đại"
        ],
        correctIndex: 2,
        explanation: "Thuyết Bất khả tri (Agnosticism) là học thuyết triết học phủ nhận một phần hoặc toàn bộ khả năng nhận thức thế giới một cách chân thực của con người."
      },
      {
        id: "s1-q7",
        question: "Ai là người trực tiếp đặt nền móng và đóng vai trò sáng lập Chủ nghĩa duy vật biện chứng?",
        options: [
          "Karl Marx và Friedrich Engels",
          "Vladimir Ilyich Lenin",
          "Georg Wilhelm Friedrich Hegel",
          "Ludwig Feuerbach"
        ],
        correctIndex: 0,
        explanation: "Karl Marx và Friedrich Engels là hai nhà sáng lập vĩ đại của Chủ nghĩa duy vật biện chứng vào những năm 1840."
      },
      {
        id: "s1-q8",
        question: "Thế giới quan là gì?",
        options: [
          "Là toàn bộ tri thức toán học về vũ trụ hình cầu",
          "Hệ thống quan điểm, quan niệm của con người về thế giới và về vị trí của con người trong thế giới đó",
          "Phương pháp luận đấu tranh kinh tế của giai cấp công nhân",
          "Là thế giới tự nhiên bên ngoài dưới lăng kính kính viễn vọng"
        ],
        correctIndex: 1,
        explanation: "Thế giới quan là khái niệm triết học chỉ hệ thống các quan điểm, quan niệm chung nhất của con người về thế giới mục tiêu khách quan và vị trí bản thân trong đó."
      },
      {
        id: "s1-q9",
        question: "Cuộc cách mạng triết học do Marx và Engels thực hiện bao gồm việc kế thừa hạt nhân hợp lý nào của Hegel?",
        options: [
          "Chủ nghĩa duy vật siêu hình",
          "Phép biện chứng nhưng đặt trên lập trường duy vật",
          "Chủ nghĩa duy tâm khách quan trừu tượng",
          "Học thuyết về nhà nước quân chủ Phổ"
        ],
        correctIndex: 1,
        explanation: "Marx và Engels đã lọc bỏ hệ thống duy tâm thần bí của Hegel, chỉ giữ lại 'hạt nhân hợp lý' là Phép biện chứng và cải tạo nó trên lập trường duy vật biện chứng thống nhất."
      },
      {
        id: "s1-q10",
        question: "Triết học Mác - Lênin đóng vai trò gì đối với khoa học cụ thể?",
        options: [
          "Thay thế mọi khoa học cụ thể bằng các tín điều phổ quát",
          "Là thế giới quan và phương pháp luận chung nhất hướng dẫn nghiên cứu",
          "Là một nhánh phụ trợ không liên quan đến thực tiễn khoa học tự nhiên",
          "Chứng minh tất cả lý lý toán học cổ điển là hoàn toàn sai lệch"
        ],
        correctIndex: 1,
        explanation: "Triết học Mác - Lênin không thay thế các khoa học chuyên ngành, mà đóng vai trò là thế giới quan khoa học và phương pháp luận chung nhất định hướng cho hoạt động nghiên cứu khoa học cụ thể."
      }
    ]
  },
  {
    id: 2,
    title: "Trạm 2: Chủ nghĩa duy vật biện chứng",
    description: "Chủ nghĩa duy vật biện chứng, mối quan hệ giữa vật chất và ý thức, 2 nguyên lý, 3 quy luật, 6 cặp phạm trù.",
    iconName: "Hub",
    introduction: "Trạm 2 là trọng tâm lý luận của phép biện chứng duy vật. Tại đây, bạn sẽ làm quen với định nghĩa kinh điển về Vật chất của Lênin, bản chất sáng tạo của Ý thức, cùng với bản đồ cấu trúc đồ sộ: 2 Nguyên lý, 3 Quy luật lớn và 6 Cặp phạm trù biện chứng.",
    lessons: [
      {
        id: "s2-l1",
        title: "Vật chất và Ý thức",
        subtitle: "Bản thể luận duy vật biện chứng",
        summary: "Định nghĩa vật chất của Lênin và mối quan hệ biện chứng hai chiều giữa vật chất khách quan và ý thức chủ quan.",
        sections: [
          {
            heading: "1. Định nghĩa Vật chất của V.I. Lênin",
            paragraphs: [
              "Trong tác phẩm 'Chủ nghĩa duy vật và chủ nghĩa kinh nghiệm phê phán', Lênin đưa ra định nghĩa kinh điển:",
              "\"Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác\".",
              "Ý nghĩa cốt lõi của định nghĩa: Khẳng định thuộc tính chung nhất của vật chất là tồn tại khách quan (ở ngoài và không phụ thuộc ý thức). Nó đập tan luận điệu duy tâm và giải quyết triệt để vấn đề cơ bản của triết học."
            ]
          },
          {
            heading: "2. Nguồn gốc, Bản chất của Ý thức",
            paragraphs: [
              "Nguồn gốc tự nhiên: Ý thức là thuộc tính của một dạng vật chất sống có tổ chức cao nhất - bộ não con người. Nó là kết quả của sự tương tác giữa thế giới khách quan lên bộ não thông qua quá trình phản ánh lý-hóa-sinh học.",
              "Nguồn gốc xã hội (Quyết định trực tiếp): Để hình thành ý thức, con người cần Lao động (biến đổi tự nhiên, chế tạo công cụ) và Ngôn ngữ (hệ thống ký hiệu truyền tải tư duy, giao tiếp). Lao động và Ngôn ngữ đã làm thay đổi bộ não, sinh ra năng lực tư duy trừu tượng.",
              "Bản chất của ý thức: Là sự phản ánh năng động, sáng tạo thế giới khách quan vào bộ não người; là 'hình ảnh chủ quan của thế giới khách quan'."
            ]
          }
        ]
      },
      {
        id: "s2-l2",
        title: "Hệ thống Phép biện chứng Duy vật",
        subtitle: "2 Nguyên lý, 3 Quy luật & 6 Cặp phạm trù",
        summary: "Bức tranh toàn cảnh về phương pháp luận biện chứng phản ánh sự vận động không ngừng của vũ trụ.",
        sections: [
          {
            heading: "1. Hai Nguyên lý phổ quát",
            paragraphs: [
              "Nguyên lý về mối liên hệ phổ biến: Mọi sự vật, hiện tượng trong thế giới không tồn tại cô lập mà luôn liên hệ, ràng buộc, thâm nhập và chuyển hóa lẫn nhau.",
              "Nguyên lý về sự phát triển: Phát triển là khuynh hướng chung của sự vận động đi lên, từ thấp đến cao, từ đơn giản đến phức tạp, từ kém hoàn thiện đến hoàn thiện hơn."
            ]
          },
          {
            heading: "2. Ba Quy luật cơ bản",
            paragraphs: [
              "Quy luật Lượng - Chất: Chỉ ra cách thức của sự vận động và phát triển. Sự thay đổi dần dần về Lượng vượt quá giới hạn Độ tại Điểm nút sẽ dẫn đến Bước nhảy làm Chất mới ra đời.",
              "Quy luật Mâu thuẫn (Thống nhất và đấu tranh của các mặt đối lập): Chỉ ra nguồn gốc, động lực bên trong của sự phát triển. Bản thân sự vật luôn chứa đựng các mặt đối lập tranh đấu thúc đẩy liên tục.",
              "Quy luật Phủ định của phủ định: Chỉ ra khuynh hướng, chu kỳ xoáy ốc của sự phát triển (khẳng định -> phủ định lần 1 -> phủ định lần 2 tạo ra cái mới dường như lặp lại cái cũ ở trình độ cao hơn)."
            ]
          },
          {
            heading: "3. Sáu Cặp phạm trù biện chứng",
            paragraphs: [
              "Các cặp quan hệ phản ánh cấu trúc tương hỗ liên tục bao gồm: Cái chung và Cái riêng; Nguyên nhân và Kết quả; Tất nhiên và Ngẫu nhiên; Nội dung và Hình thức; Bản chất và Hiện tượng; Khả năng và Hiện thực."
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: "s2-q1",
        question: "Thuộc tính phổ biến nhất, quan trọng nhất của mọi dạng vật chất được Lênin khẳng định trong định nghĩa là gì?",
        options: [
          "Tốc độ ánh sáng cực đỉnh",
          "Tồn tại khách quan ngoài ý thức con người",
          "Có khối lượng nghỉ lớn hơn không",
          "Có cấu trúc nguyên tử gồm electron"
        ],
        correctIndex: 1,
        explanation: "Thuộc tính quan trọng nhất của vật chất trong định nghĩa của Lênin là 'thực tại khách quan', tồn tại độc lập, không phụ thuộc vào cảm giác và ý thức con người."
      },
      {
        id: "s2-q2",
        question: "Ý thức của con người có nguồn gốc trực tiếp và quyết định từ đâu?",
        options: [
          "Sự tiến hóa thần kỳ thuần sinh học của vượn người",
          "Lao động và ngôn ngữ trong quá trình hoạt động xã hội",
          "Dòng năng lượng vũ trụ huyền bí kích hoạt",
          "Sự truyền đạt của thần linh thông qua giấc mơ học sĩ"
        ],
        correctIndex: 1,
        explanation: "Mặc dù bộ não là cơ sở tự nhiên, nhưng nguồn gốc trực tiếp thúc đẩy bộ não người tư duy sáng tạo chính là thực tiễn lao động và ngôn ngữ giao tiếp xã hội."
      },
      {
        id: "s2-q3",
        question: "Phép biện chứng duy vật gồm mấy nguyên lý cơ bản?",
        options: [
          "6 nguyên lý",
          "2 nguyên lý",
          "3 nguyên lý",
          "5 nguyên lý"
        ],
        correctIndex: 1,
        explanation: "Phép biện chứng duy vật dựa trên 2 nguyên lý xương sống: Nguyên lý về mối liên hệ phổ biến và Nguyên lý về sự phát triển."
      },
      {
        id: "s2-q4",
        question: "Quy luật nào của phép biện chứng duy vật chỉ ra phương thức hoặc cách thức của sự phát triển?",
        options: [
          "Quy luật mâu thuẫn đối lập",
          "Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến thay đổi về chất và ngược lại",
          "Quy luật phủ định của phủ định",
          "Quy luật đấu tranh giai cấp triệt để"
        ],
        correctIndex: 1,
        explanation: "Quy luật chuyển hóa Lượng - Chất chỉ ra CÁCH THỨC tiến hành: tích lũy dần về lượng đạt đến điểm nút thực hiện bước nhảy biến đổi về chất."
      },
      {
        id: "s2-q5",
        question: "Quy luật nào được gọi là 'Hạt nhân' của phép biện chứng duy vật vì nó chỉ ra nguồn gốc, động lực bên trong của sự phát triển?",
        options: [
          "Quy luật lượng chất",
          "Quy luật phủ định của phủ định",
          "Quy luật thống nhất và đấu tranh của các mặt đối lập (mâu thuẫn)",
          "Quy luật tương tác cơ học vũ trụ"
        ],
        correctIndex: 2,
        explanation: "Quy luật mâu thuẫn (Thống nhất và đấu tranh của các mặt đối lập) được V.I. Lênin coi là hạt nhân của phép biện chứng vì giải thích nguồn gốc, động lực sâu xa bên trong sự vật phát triển."
      },
      {
        id: "s2-q6",
        question: "Quy luật Phủ định của phủ định chỉ ra đặc điểm gì của sự phát triển?",
        options: [
          "Sự đi xuống thoái lui vĩnh viễn",
          "Khuynh hướng phát triển tiến lên theo đường xoáy ốc",
          "Đường thẳng tắp tắp không bao giờ quay đầu",
          "Sự hỗn loạn ngẫu nhiên không có tính quy luật"
        ],
        correctIndex: 1,
        explanation: "Quy luật phủ định của phủ định chỉ ra KHUYNH HƯỚNG của sự phát triển là tiến lên liên tục, kế thừa nhưng không theo đường thẳng mà theo đường xoáy ốc đi lên."
      },
      {
        id: "s2-q7",
        question: "Trong mối quan hệ biện chứng giữa vật chất và ý thức, vai trò quyết định thuộc về cái nào?",
        options: [
          "Ý thức quyết định hoàn toàn",
          "Hai cái độc lập không tác động nhau",
          "Vật chất quyết định ý thức",
          "Cảm giác chủ quan quyết định trạng thái vật chất"
        ],
        correctIndex: 2,
        explanation: "Lập trường duy vật biện chứng khẳng định Vật chất quyết định Ý thức về nguồn gốc, nội dung và sự vận động, nhưng Ý thức có tính độc lập tương đối và tác động trở lại mạnh mẽ thực tiễn thông qua con người."
      },
      {
        id: "s2-q8",
        question: "Cặp phạm trù biện chứng nào phản ánh mối liên hệ giữa các mặt bản chất bên trong ổn định và biểu hiện bên ngoài tạm thời?",
        options: [
          "Nguyên nhân và Kết quả",
          "Tất nhiên và Ngẫu nhiên",
          "Bản chất và Hiện tượng",
          "Khả năng và Hiện thực"
        ],
        correctIndex: 2,
        explanation: "Bản chất là tổng hợp những mối liên hệ khách quan bên trong ổn định sâu sắc, còn hiện tượng là sự thể hiện bên ngoài của bản chất đó."
      },
      {
        id: "s2-q9",
        question: "Thế nào là 'Bước nhảy' trong quy luật lượng chất?",
        options: [
          "Sự tích lũy lượng cực nhỏ tĩnh lặng",
          "Giai đoạn trung gian chuẩn bị tích lũy lượng",
          "Sự thay đổi về chất của sự vật do việc tích lũy lượng đạt đến giới hạn điểm nút",
          "Sự dịch chuyển vị trí đơn thuần trong không gian cơ học"
        ],
        correctIndex: 2,
        explanation: "Bước nhảy là phạm trù triết học chỉ sự chuyển hóa về chất của sự vật do sự thay đổi về lượng trước đó gây ra tại điểm nút."
      },
      {
        id: "s2-q10",
        question: "Phát biểu nào sau đây thể hiện tinh thần đúng đắn của phép biện chứng về mối liên hệ phổ biến?",
        options: [
          "Cái riêng tồn tại biệt lập, không gia nhập vào cái chung",
          "Các sự vật hiện tượng chỉ liên hệ khi bộ não con người suy nghĩ về chúng",
          "Mối liên hệ mang tính khách quan, phổ biến và có tính đa dạng phong phú",
          "Mối liên hệ chỉ có ở giới hữu cơ sinh vật, giới vô cơ hoàn toàn cô lập"
        ],
        correctIndex: 2,
        explanation: "Mối liên hệ có tính khách quan (tự thân sự vật gắn kết), phổ biến (ở tất cả không gian, thời gian) và đa dạng phong phú (mặt liên hệ trực tiếp, gián tiếp, bên trong, bên ngoài)."
      }
    ]
  },
  {
    id: 3,
    title: "Trạm 3: Chủ nghĩa duy vật lịch sử",
    description: "Chủ nghĩa duy vật lịch sử, lực lượng sản xuất, quan hệ sản xuất, cơ sở hạ tầng và kiến trúc thượng tầng.",
    iconName: "GitBranch",
    introduction: "Trạm 3 áp dụng thế giới quan duy vật biện chứng vào lịch sử xã hội loài người. Marx đã phát hiện ra quy luật vận động lớn: Lực lượng sản xuất quyết định Quan hệ sản xuất, và Cơ sở hạ tầng quyết định Kiến trúc thượng tầng của nhà nước và tư tưởng.",
    lessons: [
      {
        id: "s3-l1",
        title: "Sản xuất vật chất và Quy luật Lực lượng sản xuất - Quan hệ sản xuất",
        subtitle: "Động lực kinh tế xã hội",
        summary: "Khám phá nền tảng tồn tại xã hội thông qua lao động sản xuất thực tiễn và sự mâu thuẫn thúc đẩy lịch sử.",
        sections: [
          {
            heading: "1. Vai trò quyết định của Sản xuất vật chất",
            paragraphs: [
              "Để làm khoa học, nghệ thuật, chính trị, con người trước hết phải ăn, mặc, ở và có công cụ sinh hoạt. Vì vậy, sản xuất vật chất là cơ sở quyết định sự tồn tại và phát triển của xã hội.",
              "Xã hội loài người thay đổi từ thời đại này sang thời đại khác không phải bắt đầu từ sự tự ý thức của các vị hoàng đế, mà từ sự thay đổi công cụ lao động sản xuất."
            ]
          },
          {
            heading: "2. Quy luật Quan hệ sản xuất phù hợp với Trình độ phát triển của Lực lượng sản xuất",
            paragraphs: [
              "Phương thức sản xuất là sự thống nhất giữa Lực lượng sản xuất (LLSX) và Quan hệ sản xuất (QHSX).",
              "Lực lượng sản xuất (Nội dung động, liên tục biến đổi): Gồm Người lao động (kinh nghiệm, kỹ năng) và Tư liệu sản xuất (trong đó Công cụ lao động là yếu tố năng động cách mạng nhất).",
              "Quan hệ sản xuất (Hình thức xã hội của sản xuất, có xu hướng ổn định tương đối): Gồm 3 mặt: Quan hệ sở hữu tư liệu sản xuất (quyết định nhất), Quan hệ tổ chức quản lý, và Quan hệ phân phối sản phẩm.",
              "Biện chứng LLSX và QHSX: LLSX phát triển không ngừng đụng chạm trực tiếp tới vỏ bọc ngoài là QHSX lỗi thời. Vỏ bọc bị phá vỡ thông qua cách mạng xã hội để xác lập QHSX mới phù hợp hơn, thúc đẩy lịch sử sang hình thái kinh tế - xã hội cao hơn."
            ]
          }
        ]
      },
      {
        id: "s3-l2",
        title: "Cơ sở hạ tầng và Kiến trúc thượng tầng",
        subtitle: "Cấu trúc thượng bộ của xã hội",
        summary: "Phân tích mối liên hệ biện chứng giữa nền tảng kinh tế hiện thực và hệ thống nhà nước pháp luật tư tưởng định hình cuộc sống.",
        sections: [
          {
            heading: "1. Cơ sở hạ tầng là gì?",
            paragraphs: [
              "Cơ sở hạ tầng là toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế của một xã hội nhất định ở một giai đoạn lịch sử cụ thể. Nó gồm: QHSX tiền thống trị, QHSX thống trị hiện hữu (giữ vai trò chủ đạo) và QHSX tàn dư."
            ]
          },
          {
            heading: "2. Kiến trúc thượng tầng là gì?",
            paragraphs: [
              "Kiến trúc thượng tầng là toàn bộ những quan điểm, tư tưởng xã hội (chính trị, pháp quyền, đạo đức, tôn giáo, triết học...) cùng với những thiết chế xã hội tương ứng (nhà nước, đảng phái, giáo hội, các tòa án...) được hình thành trên cơ sở hạ tầng nhất định.",
              "Trong đó, Nhà nước là công cụ có quyền lực mạnh nhất để bảo vệ giai cấp thống trị về mặt kinh tế."
            ]
          },
          {
            heading: "3. Mối quan hệ biện chứng",
            paragraphs: [
              "Cơ sở hạ tầng quyết định bản chất kiến trúc thượng tầng. Kinh tế thế nào thì chính trị tư tưởng thế ấy. Khi cơ sở kinh tế thay đổi sâu sắc, toàn bộ hệ thống triết học, luật pháp, chính trị bề trên cũng sẽ sớm muộn biến đổi theo.",
              "Ngược lại, Kiến trúc thượng tầng có sự tác động ngược lại cực kỳ mạnh mẽ, đặc biệt là thông qua quyền lực cưỡng chế của Nhà nước nhằm duy trì trật tự kinh tế có lợi cho nó."
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: "s3-q1",
        question: "Cơ sở duy nhất quyết định sự tồn tại và phát triển bền vững của xã hội loài người theo chủ nghĩa duy vật lịch sử là gì?",
        options: [
          "Ý chí tự do của các bậc quân vương anh minh",
          "Sự sản xuất vật chất",
          "Văn bản tôn giáo cổ đại",
          "Các hoạt động vui chơi giải trí"
        ],
        correctIndex: 1,
        explanation: "Sản xuất vật chất là hoạt động thực tiễn cơ bản nhất đảm bảo đầy đủ lương thực, nhu yếu phẩm nuôi sống xã hội, là nền tảng tối cao quyết định lịch sử xã hội."
      },
      {
        id: "s3-q2",
        question: "Yếu tố nào trong lực lượng sản xuất là yếu tố năng động và cách mạng nhất, luôn thay đổi trước tiên?",
        options: [
          "Nhà xưởng, kho bãi",
          "Công cụ lao động",
          "Đối tượng lao động như tài nguyên thiên nhiên",
          "Phương thức đóng gói sản phẩm đại diện"
        ],
        correctIndex: 1,
        explanation: "Trong LLSX, công cụ lao động là yếu tố năng động nhất. Do con người luôn tìm cách cải tiến công nghệ, kỹ thuật sản xuất để giảm bớt sức nặng vật lý và tăng hiệu suất."
      },
      {
        id: "s3-q3",
        question: "Trong Quan hệ sản xuất, quan hệ nào đóng vai trò quyết định chi phối trực tiếp đến các quan hệ khác?",
        options: [
          "Quan hệ phân phối sản phẩm tiêu thụ",
          "Quan hệ sở hữu đối với tư liệu sản xuất",
          "Quan hệ tổ chức và trực tiếp quản lý cơ sở",
          "Quan hệ báo cáo định kỳ của các cơ quan"
        ],
        correctIndex: 1,
        explanation: "Quan hệ sở hữu đối với tư liệu sản xuất quyết định ai là người nắm giữ phương tiện thực tế sản xuất, từ đó quyết định quyền tổ chức quản lý và cách phân chia quyền lợi kinh tế."
      },
      {
        id: "s3-q4",
        question: "Đại lượng nào dùng để chỉ toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế hiện thực của xã hội?",
        options: [
          "Kiến trúc thượng tầng",
          "Cơ sở hạ tầng",
          "Hình thái kinh tế - xã hội hoàn chỉnh",
          "Sự đấu tranh giai cấp khốc liệt"
        ],
        correctIndex: 1,
        explanation: "Cơ sở hạ tầng là toàn bộ các quan hệ sản xuất hợp thành kết cấu kinh tế hiện thực của một xã hội nhất định."
      },
      {
        id: "s3-q5",
        question: "Thiết chế chính trị xã hội nào có quyền lực mạnh nhất và nắm vai trò trung tâm trong Kiến trúc thượng tầng?",
        options: [
          "Các hội nhóm thể thao quần chúng",
          "Nhà nước",
          "Học viện triết học danh tiếng",
          "Tổ chức từ thiện quốc tế"
        ],
        correctIndex: 1,
        explanation: "Nhà nước là thiết chế pháp lý vĩ mô mạnh nhất có sức mạnh vũ trang bạo lực cưỡng chế định hình và bảo vệ vững chắc kết cấu giai cấp thống trị."
      },
      {
        id: "s3-q6",
        question: "Quy luật cơ bản quyết định sự thay thế tuần tự của các hình thái kinh tế - xã hội trong lịch sử là gì?",
        options: [
          "Quy luật bảo toàn năng lượng cơ học",
          "Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất",
          "Quy luật sinh lão bệnh tử nhân học",
          "Sự thống nhất ngôn ngữ toàn thế giới"
        ],
        correctIndex: 1,
        explanation: "Quy luật QHSX phù hợp trình độ LLSX là quy luật khách quan, tối cao chi phối sự tự chuyển hóa của các phương thức sản xuất xuyên suốt tiến trình lịch sử xã hội."
      },
      {
        id: "s3-q7",
        question: "Theo quan điểm duy vật lịch sử, Nhà nước xuất hiện từ bao giờ?",
        options: [
          "Có ngay từ khi loài người mới xuất hiện trong thời kỳ bầy người nguyên thủy",
          "Khi xã hội phân chia thành các giai cấp đối kháng và mâu thuẫn giai cấp không thể điều hòa được",
          "Khi con người phát hiện ra lửa để rèn kiếm sắt",
          "Khi các bộ tộc cùng ký kết một bản khế ước xã hội hòa bình tự nguyện"
        ],
        correctIndex: 1,
        explanation: "Nhà nước là sản phẩm của một xã hội đã phát triển đến một mức độ mâu thuẫn giai cấp đối kháng không thể tự điều hòa, xuất hiện để duy trì trật tự trong giới hạn chấp nhận được."
      },
      {
        id: "s3-q8",
        question: "Ý thức xã hội là gì?",
        options: [
          "Sự tổng hợp các xung động điện học trong vỏ não",
          "Mặt tinh thần của đời sống xã hội, bao gồm tình cảm, tư tưởng, lý luận phản ánh tồn tại xã hội",
          "Là tổng số lượng sách báo được in ra trong một năm",
          "Là dư luận phán xét bộc phát trên các mạng xã hội tư nhân"
        ],
        correctIndex: 1,
        explanation: "Ý thức xã hội là khái niệm chỉ toàn bộ đời sống tinh thần của xã hội (khoa học, triết học, đạo đức, tâm tư tình cảm tập thể) được sinh ra từ việc phản ánh tồn tại xã hội khách quan."
      },
      {
        id: "s3-q9",
        question: "Phát biểu nào đúng về mối quan hệ giữa Tồn tại xã hội và Ý thức xã hội?",
        options: [
          "Ý thức xã hội quyết định tuyệt đối Tồn tại xã hội",
          "Tồn tại xã hội quyết định Ý thức xã hội, nhưng Ý thức xã hội có tính độc lập tương đối",
          "Hai yếu tố hoàn hảo độc lập và song hành ngang bằng nhau",
          "Ý thức xã hội luôn tụt hậu ngàn năm và không tác động gì đến kinh tế thực tế"
        ],
        correctIndex: 1,
        explanation: "Tồn tại xã hội (đặc biệt là phương thức sản xuất vật chất) quyết định ý thức xã hội. Tuy nhiên ý thức xã hội có tính độc lập tương đối, nó có thể vượt trước, kế thừa, phản ánh lệch pha hoặc tác động tích cực/tiêu cực lên tồn tại kinh tế vật chất."
      },
      {
        id: "s3-q10",
        question: "Hình thái kinh tế - xã hội là một phạm trù triết học chỉ điều gì?",
        options: [
          "Hình thức địa lý biên giới đất nước",
          "Cơ cấu xã hội ở mọi thời kỳ lịch sử thống nhất gồm Lực lượng sản xuất, Cơ sở hạ tầng (Quan hệ sản xuất) và Kiến trúc thượng tầng tương ứng",
          "Toàn bộ tài sản vàng bạc tích lũy của hoàng gia phong kiến",
          "Là sự thống kê về số lượng giai cấp công nghiệp trong nhà máy"
        ],
        correctIndex: 1,
        explanation: "Hình thái kinh tế - xã hội là phạm trù duy vật lịch sử bao quát trọn vẹn xã hội ở một nấc thang lịch sử nhất định, gồm 3 yếu tố cơ bản thống nhất: Lực lượng sản xuất, QHSX (Cơ sở hạ tầng) và Kiến trúc thượng tầng tương ứng."
      }
    ]
  },
  {
    id: 4,
    title: "Trạm 4: Tiền đề lịch sử & Triết học cổ đại",
    description: "Triết học Hy Lạp cổ đại, MyThos sang Logos, Democritus, Plato, Heraclitus, Sparta, Athens và Sophists.",
    iconName: "Award",
    introduction: "Chào mừng đến với Trạm 4. Để thấu hiểu lý luận khoa học của Marx, chúng ta ngược dòng thời gian về nôi văn minh phương Tây - Hy Lạp cổ đại. Nơi tư duy loài người tiến bước nhảy vĩ đại từ MyThos (thần thoại) sang Logos (lý trí), cuộc tranh luận bất hủ giữa phái Duy vật (Democritus) và Duy tâm (Plato).",
    lessons: [
      {
        id: "s4-l1",
        title: "Bước chuyển từ MyThos sang Logos và đặc điểm triết học Hy Lạp cổ đại",
        subtitle: "Cội nguồn tư duy phương Tây",
        summary: "Sự bứt phá của tư duy khỏi thế giới thần thoại huyền bí để đi tìm những quy luật vật lý khách quan.",
        sections: [
          {
            heading: "1. Từ MyThos sang Logos",
            paragraphs: [
              "Thời kỳ đầu Hy Lạp cổ đại, con người giải thích sấm sét bằng cơn thịnh nộ của thần Zeus, sóng thần bằng cây ba chĩa của Poseidon. Cách tư duy này gọi là MyThos (tư duy thần thoại).",
              "Khi thương mại hàng hải phát triển, thị quốc Athens và các vùng Ionia phồn vinh xuất hiện, con người được cọ xát với các tri thức thiên văn toán học từ Ai Cập và Babylon. Họ bắt đầu đặt câu hỏi: Đâu là vật chất gốc (Arché) cấu thành vũ trụ mà không cần đến sự can thiệp của thần linh?",
              "Từ đó ra đời Logos (tư duy duy lý, lô-gích và thực chứng). Người đại diện mở đầu là Thales (cho rằng nước là gốc), Anaximenes (không khí), Heraclitus (lửa)."
            ]
          },
          {
            heading: "2. Cuộc đấu tranh của phái Democritus và phái Plato",
            paragraphs: [
              "Democritus (Đại diện Duy vật): Sáng lập Thuyết Nguyên tử cổ đại. Ông cho rằng vũ trụ cấu thành bởi các hạt nguyên tử siêu nhỏ, không thể phân chia, vận động trong khoảng không gian trống rỗng.",
              "Plato (Đại diện Duy tâm): Đưa ra Thuyết Ý niệm (Theory of Forms). Ông cho rằng thế giới vật chất ta thấy hàng ngày chỉ là bóng ma mờ nhạt, một bản sao lỗi phản chiếu từ thế giới 'Ý niệm tuyệt đối' hoàn hảo trên thiên đàng."
            ]
          }
        ]
      },
      {
        id: "s4-l2",
        title: "Bối cảnh lịch sử dẫn tới học thuyết Mác - Lênin",
        subtitle: "Sự hội tụ tinh hoa triết học Đức cổ điển",
        summary: "Tìm hiểu cách Marx và Engels tổng hòa biện chứng duy tâm của Hegel và duy vật siêu hình của Feuerbach.",
        sections: [
          {
            heading: "1. Tiền đề kinh tế - xã hội thế kỷ XIX",
            paragraphs: [
              "Sự bùng nổ của Cách mạng công nghiệp biến giai cấp vô sản công nghiệp thành lực lượng chính trị đấu tranh độc lập chống giai cấp tư sản. Thực tiễn thúc bách yêu cầu cần có một lý luận khoa học hướng đường cho giai cấp công nhân."
            ]
          },
          {
            heading: "2. Tiền đề lý luận khoa học tự nhiên và triết học",
            paragraphs: [
              "Học thuyết tế bào, Quy luật bảo toàn và chuyển hóa năng lượng, Thuyết tiến hóa của Darwin đã chứng minh thế giới tự nhiên là một dòng chảy biện chứng, liên tục tự vận động chứ không phải do Chúa tạo lập tĩnh lặng.",
              "Về Triết học: Marx và Engels kế thừa phép biện chứng của G.W.F. Hegel nhưng tước bỏ tính duy tâm; đồng thời kế thừa chủ nghĩa duy vật của Ludwig Feuerbach nhưng tước bỏ tính siêu hình nhân bản ngây thơ để sáng lập nên triết học duy vật biện chứng hoàn mỹ."
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: "s4-q1",
        question: "Bước chuyển 'MyThos sang Logos' trong lịch sử tư duy Hy Lạp có nghĩa là gì?",
        options: [
          "Sự chuyển dịch chế độ cộng hòa sang đế quốc La Mã",
          "Chuyển từ tư duy thần thoại, thần thánh sang tư duy duy lý, khoa học và thực cứng",
          "Sự chuyển ngôn ngữ viết cổ sang hệ thống chữ cái Latin mới",
          "Sự thần thánh hóa các hoàng đế Hy Lạp"
        ],
        correctIndex: 1,
        explanation: "Bước chuyển 'MyThos sang Logos' đại diện cho việc con người từ bỏ việc giải thích vũ trụ bằng thần thoại (MyThos) để tìm quy luật tự nhiên bằng lý trí logic lập luận khoa học (Logos)."
      },
      {
        id: "s4-q2",
        question: "Nhà triết học đầu tiên trong lịch sử Hy Lạp cổ đại cho rằng 'Nước' là bản nguyên (Arché) của mọi sự vật trong vũ trụ là ai?",
        options: [
          "Socrates",
          "Thales",
          "Anaximander",
          "Aristotle"
        ],
        correctIndex: 1,
        explanation: "Thales xứ Miletus được coi là nhà triết học đầu tiên khi cố giải thích bản nguyên thế giới bằng một chất vật chất cụ thể là Nước, mà không viện đến thần thoại thần linh."
      },
      {
        id: "s4-q3",
        question: "Ai là đại diện tiêu biểu nhất cho học thuyết nguyên tử luận cổ đại và dòng triết học duy vật Hy Lạp cổ đại?",
        options: [
          "Plato",
          "Democritus",
          "Zeno",
          "Epicurus"
        ],
        correctIndex: 1,
        explanation: "Democritus cùng người thầy Leucippus là đại diện xuất sắc nhất của thuyết Nguyên tử cổ đại, khẳng định thế giới cấu thành từ hạt nguyên tử vô hạn và khoảng không vật lý bổ trợ khách quan."
      },
      {
        id: "s4-q4",
        question: "Trong vương quốc ý niệm của Plato, thế giới vật chất cảm tính của chúng ta có bản chất là gì?",
        options: [
          "Thực tại khách quan duy nhất vững bền",
          "Là cái bóng mờ, bản sao không hoàn hảo phản chiếu thế giới Ý niệm",
          "Là sản phẩm của quá trình chọn lọc tự nhiên sinh học",
          "Một tập hợp các hạt electron chuyển động không ngừng"
        ],
        correctIndex: 1,
        explanation: "Plato khẳng định thế giới vật chất cảm tính quanh ta chỉ là 'cái bóng' mờ nhạt, một bản sao méo mó phản chiếu thế giới Ý niệm hoàn hảo duy nhất có thực chân lý."
      },
      {
        id: "s4-q5",
        question: "Heraclitus nổi tiếng với câu nói triết lý biện chứng kinh điển nào thể hiện dòng cháy không ngừng của thời gian?",
        options: [
          "Tôi tư duy, nên tôi tồn tại",
          "Không ai có thể tắm hai lần trên cùng một dòng sông",
          "Vật chất là phức hợp của các cảm giác chủ quan",
          "Mọi con đường đều dẫn tới thành Rome cổ kính"
        ],
        correctIndex: 1,
        explanation: "Heraclitus là cha đẻ của phép biện chứng cổ đại với đúc kết kinh điển 'Không ai tắm hai lần trên cùng một dòng sông', tượng trưng cho thế giới liên tục trôi chảy, biến đổi sinh diệt không ngừng."
      },
      {
        id: "s4-q6",
        question: "Phái Ngụy biện (Sophists) thời kỳ Hy Lạp cổ đại tập trung giảng dạy kỹ năng gì nổi tiếng nhất?",
        options: [
          "Kỹ thuật rèn sắt chế tác vũ khí máy phát điện",
          "Nghệ thuật hùng biện, tranh luận và ngụy lý luận tìm kiếm chiến thắng",
          "Nghi thức hiến tế rực rỡ dâng các vị thần",
          "Toán học đại số cao cấp lượng tử"
        ],
        correctIndex: 1,
        explanation: "Các nhà Ngụy biện (Sophists) là những người thầy dạy học lưu động, cực kỳ chú trọng dạy thuật hùng biện, tranh luận biện hộ và các kỹ năng lập luận sắc sảo thúc đẩy hoạt động dân chủ tại Athens."
      },
      {
        id: "s4-q7",
        question: "Nền dân chủ trực tiếp nổi tiếng đối kháng với chế độ quân phiệt Sparta trong thế giới Hy Lạp được duy trì ở thị quốc nào?",
        options: [
          "Miletus",
          "Athens",
          "Alexandria",
          "Thebes"
        ],
        correctIndex: 1,
        explanation: "Athens là trung tâm văn hóa tinh hoa kiệt xuất, nơi duy trì thể chế Dân chủ trực tiếp cổ đại tiến bộ, tương phản sâu sắc với vương quốc quân phiệt tập quyền Sparta."
      },
      {
        id: "s4-q8",
        question: "Phát minh khoa học tự nhiên thế kỷ XIX nào trực tiếp giáng đòn quyết định đập tan thế giới quan siêu hình cho rằng các loài sinh vật sinh ra tĩnh tại không tiến hóa?",
        options: [
          "Học thuyết điện từ trường của Maxwell",
          "Học thuyết tiến hóa bằng con đường chọn lọc tự nhiên của Charles Darwin",
          "Bảng tuần hoàn các nguyên tố hóa học Mendeleev",
          "Phát minh ra động cơ hơi nước Watt"
        ],
        correctIndex: 1,
        explanation: "Học thuyết tiến hóa của Darwin giải thích các loài sinh vật liên tục tự tương tác thích nghi môi trường và biến đổi, tuyệt đối không phải do Chúa trời tạo ra vĩnh viễn không đổi, củng cố thế giới quan duy vật biện chứng."
      },
      {
        id: "s4-q9",
        question: "Nhà triết học Đức cổ điển nào đã sáng lập nên phép biện chứng đồ sộ nhưng lại đứng trên lập trường duy tâm tinh thần tuyệt đối?",
        options: [
          "Ludwig Feuerbach",
          "Georg Wilhelm Friedrich Hegel",
          "Immanuel Kant",
          "Karl Marx"
        ],
        correctIndex: 1,
        explanation: "Hegel là đỉnh cao triết học cổ điển Đức về phép biện chứng nhưng ông cho rằng toàn vũ trụ chỉ là sự tự tha hóa của 'Ý niệm tuyệt đối' (Duy tâm khách quan)."
      },
      {
        id: "s4-q10",
        question: "Hạn chế lớn nhất trong triết học duy vật của Ludwig Feuerbach khiến Marx phê phán là gì?",
        options: [
          "Ông phủ nhận sự tồn tại của cơ thể con người sinh học",
          "Ông vẫn mang tính siêu hình khi nhìn nhận con người tách biệt khỏi lịch sử thực tiễn xã hội, và duy tâm trong lĩnh vực đời sống lịch sử đạo đức",
          "Ông sùng bái giáo hội Công giáo La Mã tuyệt đối",
          "Ông cho rằng nước và không khí cấu thành thế giới nguyên sơ"
        ],
        correctIndex: 1,
        explanation: "Feuerbach khôi phục chủ nghĩa duy vật chống lại Hegel rất xuất sắc, nhưng chủ nghĩa duy vật của ông là duy vật siêu hình, chưa hiểu vai trò của thực tiễn cách mạng xã hội, và khi giải thích lịch sử xã hội ông lại rơi vào duy tâm."
      }
    ]
  }
];

export const BOOKS_DATA: Book[] = [
  {
    id: "b1",
    title: "Tư Bản Luận (Das Kapital)",
    author: "Karl Marx",
    year: "1867",
    summary: "Tác phẩm kinh tế - chính trị đồ sộ nhất của Karl Marx. Ông phân tích sâu sắc dòng chảy tuần hoàn của Tư bản, khám phá ra quy luật Giá trị thặng dư - bí mật bản chất bóc lột của phương thức sản xuất tư bản chủ nghĩa, đồng thời dự báo các chu kỳ khủng hoảng kinh tế mang tính hệ thống.",
    keyQuote: "Tư bản không thể xuất hiện từ lưu thông, và cũng không thể xuất hiện ở ngoài lưu thông. Nó phải xuất hiện trong lưu thông và đồng thời không phải trong lưu thông.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    category: "Marxist-Leninist"
  },
  {
    id: "b2",
    title: "Tuyên Ngôn của Đảng Cộng Sản",
    author: "Karl Marx & Friedrich Engels",
    year: "1848",
    summary: "Văn kiện chính trị mang tầm vóc lịch sử nhân loại vô song. Marx và Engels đã trình bày thế giới quan mới một cách cô đọng: Lịch sử nhân loại là lịch sử đấu tranh giai cấp, sứ mệnh lịch sử quốc tế của giai cấp vô sản, khẳng định sự sụp đổ tất yếu của chủ nghĩa tư bản và thắng lợi của xã hội chủ nghĩa.",
    keyQuote: "Sự phát triển tự do của mỗi người là điều kiện cho sự phát triển tự do của tất cả mọi người.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    category: "Marxist-Leninist"
  },
  {
    id: "b3",
    title: "Hiện Tượng Học Tinh Thần",
    author: "Georg Wilhelm Friedrich Hegel",
    year: "1807",
    summary: "Một trong những tác phẩm triết học khó hiểu và đồ sộ nhất lịch sử tư tưởng phương Tây. Hegel mô tả hành trình tự nhận thức gian nan của Tinh thần tuyệt đối từ mức độ cảm giác thô sơ đến nhận thức lý tính tuyệt đối, xây dựng hệ thống phép biện chứng vĩ mô cổ điển.",
    keyQuote: "Cái gì hợp lý thì là hiện thực, cái gì hiện thực thì là hợp lý.",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400",
    category: "Classical Philosophy"
  },
  {
    id: "b4",
    title: "Nhà Nước (Republic)",
    author: "Plato",
    year: "Khoảng 375 TCN",
    summary: "Tác phẩm đối thoại triết học kinh điển nhất của Plato. Thông qua hình tượng người thầy Socrates, ông phác thảo một mô hình nhà nước lý tưởng lý thuyết cai trị bởi những vị Vua Triết học nhân bản, thảo luận về ý niệm Công lý, bản chất Linh hồn, và câu chuyện huyền thoại 'Hang động' nổi tiếng.",
    keyQuote: "Cho đến khi các nhà triết học nắm quyền cai trị như những vị vua, hoặc những người ngày nay gọi là vua thành tâm triết lý, thì nỗi đau khổ của các quốc gia sẽ không bao giờ chấm dứt.",
    coverImage: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=400",
    category: "Classical Philosophy"
  }
];

export const FORUM_THREADS: DiscussionPost[] = [
  {
    id: "t1",
    author: "PGS.TS. Nguyễn Văn Minh",
    role: "Giảng viên",
    avatarColor: "bg-blue-850",
    title: "Ứng dụng Phép biện chứng Duy vật vào việc nhận thức Kinh tế số và Trí tuệ nhân tạo (AI)",
    content: "Chào các bạn sinh viên và đồng nghiệp, hiện nay Trí tuệ Nhân tạo (AI) đang tạo nên cuộc cách mạng công nghệ mới làm biến đổi sâu sắc thị trường lao động. Dưới góc nhìn duy vật lịch sử, đây chính là sự phát triển nhảy vọt của Lực lượng sản xuất (công cụ lao động trí tuệ). Vậy các bạn nghĩ thế nào về sự mác-xít trong mâu thuẫn giữa lực lượng sản xuất mới này và Quan hệ sản xuất hiện đại (sở hữu trí tuệ bản quyền, phân chia lợi nhuận công nghệ)? Chúng ta nghiên cứu thế nào từ quy luật mâu thuẫn này?",
    timestamp: "2026-06-05 14:30",
    likes: 42,
    replies: [
      {
        id: "r1-1",
        author: "Trần Anh Tuấn",
        role: "Người nghiên cứu",
        avatarColor: "bg-amber-600",
        content: "Em hoàn toàn đồng ý với thầy! Hệ thống bản quyền phần mềm tư hữu hiện nay đang bảo vệ lợi nhuận tập trung cho các Big Tech (Mỹ), hạn chế sự tiếp cận bình đẳng của các nước đang phát triển. Đây chính là biểu hiện QHSX tư nhân kìm hãm tính phổ biến mở của LLSX công nghệ AI đang muốn bộc phát.",
        timestamp: "2026-06-05 15:45"
      },
      {
        id: "r1-2",
        author: "Lê Thị Thu Hương",
        role: "Sinh viên",
        avatarColor: "bg-emerald-700",
        content: "Theo quy luật Lượng - Chất, khi chúng ta liên tục nạp dữ liệu khổng lồ (Lượng thay đổi) thì hành vi thông minh xuất thần xuất hiện (bước nhảy về Chất). AI bỗng nhiên có thể làm thơ, viết mã nguồn súc tích. Triết học duy vật biện chứng giải thích thực sự rất sát nghĩa vật lý hiện đại!",
        timestamp: "2026-06-06 08:12"
      }
    ],
    category: "Chủ nghĩa duy vật lịch sử"
  },
  {
    id: "t2",
    author: "ThS. Hoàng Quốc Khánh",
    role: "Trợ lý học thuật",
    avatarColor: "bg-indigo-700",
    title: "Làm thế nào để phân biệt rõ nhất giữa Duy tâm khách quan và Duy tâm chủ quan?",
    content: "Nhiều bạn sinh viên đi thi thường lúng túng khi phân biệt hai trường phái này. Tóm tắt nhanh: Duy tâm chủ quan thổi phồng vai trò của CẢM GIÁC CÁ NHÂN bạn (ví dụ: George Berkeley nói 'tồn tại tức là được tri giác' - nếu tôi nhắm mắt lại thì cái bàn biến mất). Còn Duy tâm khách quan thổi phồng vai trò của một TINH THẦN KHÁCH QUAN CÓ TRƯỚC ngoài bạn (Ý niệm của Plato, Ý niệm tuyệt đối của Hegel, Thượng đế, lực sinh mệnh vô hình). Hãy cùng thảo luận thêm ví dụ thực tế nào!",
    timestamp: "2026-06-04 10:15",
    likes: 29,
    replies: [
      {
        id: "r2-1",
        author: "Phạm Minh Đức",
        role: "Sinh viên",
        avatarColor: "bg-teal-750",
        content: "Thầy ơi cho em hỏi, câu thành ngữ 'Mưu sự tại nhân, thành sự tại thiên' có phải mang màu sắc của Chủ nghĩa duy tâm khách quan không ạ? Vì cho rằng trời đất quyết định khách quan kết quả ngoài con người?",
        timestamp: "2026-06-04 11:22"
      },
      {
        id: "r2-2",
        author: "ThS. Hoàng Quốc Khánh",
        role: "Trợ lý học thuật",
        avatarColor: "bg-indigo-700",
        content: "Chính xác em nhé! 'Thiên' hay số mệnh ông Trời quyết định kết cục lịch sử chính là tư duy duy tâm khách quan sơ khai cổ xưa của triết học Á Đông.",
        timestamp: "2026-06-04 12:05"
      }
    ],
    category: "Khái luận triết học"
  }
];
