import { useState } from "react";
import "../App.css";

function AboutPage() {
  const quizData = [
    {
      question: "What is Glaiza's Nickname?",
      options: ["Glai", "Gigi", "May", "Lia"],
      answer: 0,
    },
    {
      question: "Which color does Glaiza love the most?",
      options: ["Blue", "Green", "Pink", "Orange"],
      answer: 2,
    },
    {
      question: "What does Glaiza say fashion helps her with the most?",
      options: ["Making Friends", "Boosting Confidence", "Saving Money", "Traveling"],
      answer: 1,
    },
    {
      question: "Which type of outfit does Glaiza enjoy wearing lately?",
      options: ["Streetwear only", "Cozy outfits only", "Classy and sophisticated fits", "Sportswear"],
      answer: 2,
    },
    {
      question: "Who inspires Glaiza's fashion?",
      options: ["Movie actors", "Teachers", "Athletes", "Social Media Influencers"],
      answer: 3,
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState("");
  const [quizFinished, setQuizFinished] = useState(false);

  const currentData = quizData[currentQuestionIndex];

  const selectOption = (index) => {
    setSelectedOptionIndex(index);
  };

  const submitAnswer = () => {
    if (selectedOptionIndex === null) return;

    if (selectedOptionIndex === currentData.answer) {
      setScore(score + 1);
      setResult("Correct!");
    } else {
      setResult(`Wrong! Correct answer: ${currentData.options[currentData.answer]}`);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < quizData.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOptionIndex(null);
        setResult("");
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  return (
    <div className="about-content">
      <h2 className="about-title">About Me</h2>

      {/* Intro Section */}
      <div className="about-intro">
        <img src="/images/glai.png" className="about-pic" alt="Intro" />
        <p className="about-text">
          Hello! My name is Glaiza May B. Mangaoang, but you can call me Glai for short.
          I was born on May 7, 2005, and I am 20 years old. I love girly things, pink color,
          dressing up, make ups and boosting my self-esteem by looking my best.
          Fashion is more than just clothing to me; it is a way to express who I am and how I feel.
          Through the clothes I wear, I can show my personality, and confidence. I enjoy exploring
          different styles, colors, and trends that help me feel comfortable and true to myself.
          This portfolio highlights my love for fashion, my inspirations, and my personal style.
          It also shows how fashion has helped me grow and gain confidence over time. Through this
          collection, I share my fashion journey and how it continues to shape my identity.
        </p>
      </div>

      {/* Fashion Inspiration */}
      <section className="section">
        <h3 className="section-title">My Fashion Inspiration</h3>
        <div className="container">
          <div className="item">
            <img src="/images/inspo2.jpg" className="small-img" alt="Inspiration 1" />
          </div>
          <div className="item">
            <img src="/images/inspo3.jpg" className="small-img" alt="Inspiration 2" />
          </div>
          <div className="item">
            <img src="/images/inspo4.jpg" className="small-img" alt="Inspiration 3" />
          </div>
        </div>
        <p>
          -These social media influencers inspire me because they show different ways to style clothes
          and express confidence through fashion. I love how they mix simple pieces and turn them into
          stylish outfits that still look comfortable and real. By watching their posts and videos, I
          learn how to combine colors, choose accessories, and try new styles without being afraid.
          They motivate me to explore my own fashion and make up style and feel more confident in what
          I wear every day.
        </p>
      </section>

      {/* Personal Style */}
      <section className="section">
        <h3 className="section-title">My Personal Style</h3>
        <div className="container">
          <div className="item">
            <img src="/images/prtty1.jpg" className="small-img" alt="Pretty 1" />
          </div>
          <div className="item">
            <img src="/images/prtty2.jpg" className="small-img" alt="Pretty 2" />
          </div>
          <div className="item">
            <img src="/images/prtty3.jpg" className="small-img" alt="Pretty 3" />
          </div>
        </div>
        <p>
          My personal style is a mix of simple, trendy, and comfortable fashion. I like wearing clothes
          that make me feel confident while still being easy to move in. I often choose outfits that
          match my mood and reflect my personality, using colors and pieces that feel natural to me.
          Through time, my style has grown as I experiment with new looks and learn what truly suits me.
        </p>
      </section>

      {/* Favorite Fashion Pieces */}
      <section className="section">
        <h3 className="section-title">Favorite Fashion Pieces / Outfits</h3>
        <div className="container">
          <div className="item">
            <img src="/images/fit1.jpg" className="small-img" alt="Outfit 1" />
          </div>
          <div className="item">
            <img src="/images/fit2.jpg" className="small-img" alt="Outfit 2" />
          </div>
          <div className="item">
            <img src="/images/fit3.jpg" className="small-img" alt="Outfit 3" />
          </div>
          <div className="item">
            <img src="/images/fit4.jpg" className="small-img" alt="Outfit 4" />
          </div>
          <div className="item">
            <img src="/images/fit5.jpg" className="small-img" alt="Outfit 5" />
          </div>
          <div className="item">
            <img src="/images/fit6.jpg" className="small-img" alt="Outfit 6" />
          </div>
          <div className="item">
            <img src="/images/fit7.jpg" className="small-img" alt="Outfit 7" />
          </div>
          <div className="item">
            <img src="/images/fit8.jpg" className="small-img" alt="Outfit 8" />
          </div>
          <div className="item">
            <img src="/images/fit9.jpg" className="small-img" alt="Outfit 9" />
          </div>
        </div>
        <p>
          My favorite fashion styles include tita or classy fits, streetwear, and cozy outfits. What I
          wear usually depends on my mood, whether I feel relaxed, confident, or playful. Lately, I enjoy
          dressing in a more classy, sophisticated, and expensive-looking way because it makes me feel
          confident and put together. These outfits help me express myself better and make me feel good.
        </p>
      </section>

      {/* Fashion, Confidence, and Personal Growth */}
      <section className="section">
        <h3 className="section-title">Fashion, Confidence, and Personal Growth</h3>
        <p>
          Fashion helps boost my confidence and allows me to express myself freely. When I wear outfits
          that I like, I feel more comfortable, confident, and ready to face the day. Over time, my
          fashion style has grown as I learned what works best for me and became more open to trying new
          looks. I also realized that fashion is a way of learning about myself and showing my personality.
          In the future, I want to continue improving my style, explore more classy and sophisticated
          looks, and stay true to what makes me feel confident. Overall, my fashion journey is important
          to me because it reflects who I am and who I am becoming, I love how it boost my self confidence,
          I love how it made me feel pretty. I've never felt this self admiration before.
        </p>
      </section>

      {/* Timeline */}
      <section className="section">
        <h3 className="section-title">Timeline of My Fashion Growth</h3>
        <ol className="list">
          <li>
            <strong>Early Interest in Fashion</strong> – I started becoming interested in fashion by
            noticing different styles and learning how clothing can express personality and mood.
          </li>
          <li>
            <strong>Exploring Trends and Inspirations</strong> – I began following fashion trends and
            social media influencers to understand how outfits are styled and put together.
          </li>
          <li>
            <strong>Developing My Personal Style</strong> – I experimented with different looks such as
            streetwear, cozy outfits, and tita or classy fits to see what suited me best.
          </li>
          <li>
            <strong>Gaining Confidence Through Fashion</strong> – As I became more comfortable with my
            style choices, fashion helped boost my confidence and self-expression.
          </li>
          <li>
            <strong>Embracing a Classy and Sophisticated Look</strong> – Recently, I have focused more
            on classy, elegant, and expensive-looking outfits that make me feel confident and put together.
          </li>
          <li>
            <strong>Future Growth in Fashion</strong> – I plan to continue learning, experimenting, and
            improving my style while staying true to what makes me feel confident.
          </li>
        </ol>
      </section>

      {/* Quote */}
      <section className="section">
        <blockquote className="quote">
          <div className="container2">
            <div className="item">“Fashion is a way to say who you are without having to speak.”</div>
          </div>
        </blockquote>
      </section>

      {/* Game Time / Quiz */}
      <h3 className="section-title">Game Time!</h3>
      <div className="quiz-container">
        {!quizFinished ? (
          <>
            <h2>{currentData.question}</h2>
            {currentData.options.map((opt, i) => (
              <div
                key={i}
                className={`option ${selectedOptionIndex === i ? "selected" : ""}`}
                onClick={() => selectOption(i)}
              >
                {opt}
              </div>
            ))}
            <button onClick={submitAnswer} disabled={selectedOptionIndex === null}>
              Submit Answer
            </button>
            <p>{result}</p>
          </>
        ) : (
          <h2>
            Your final score is {score} out of {quizData.length}
          </h2>
        )}
      </div>
    </div>
  );
}

export default AboutPage;