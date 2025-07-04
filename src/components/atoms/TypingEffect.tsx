// src/components/atoms/TypingEffect.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

// 定义 TypingEffect 组件的 Props 类型
interface TypingEffectProps {
  /**
   * 需要循环展示的字符串数组。
   */
  subtitles: string[];
  /**
   * 打字速度（毫秒）。
   * @default 100
   */
  typeSpeed?: number;
  /**
   * 删除速度（毫秒）。
   * @default 50
   */
  deleteSpeed?: number;
  /**
   * 打完字后的停留时间（毫秒）。
   * @default 2000
   */
  delayAfterTyping?: number;
}

/**
 * TypingEffect 组件：一个原子级别的 UI 组件，用于实现打字机动画效果。
 *
 * 它封装了所有与动画相关的复杂逻辑，包括逐字打印、逐字删除、
 * 循环播放和时间控制。这使其成为一个高度可配置且可复用的纯功能组件。
 *
 * @param {TypingEffectProps} props - 组件属性。
 */
const TypingEffect: React.FC<TypingEffectProps> = ({
  subtitles,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayAfterTyping = 2000,
}) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % subtitles.length;
      const fullText = subtitles[i];

      // 根据是“打字”还是“删除”来更新文本
      const updatedText = isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1);

      setText(updatedText);

      // 如果删除完毕，切换到下一个词并开始打字
      if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
      // 如果打字完毕，开始删除
      else if (!isDeleting && updatedText === fullText) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, delayAfterTyping);
      }
    };

    // 设置下一次动画的定时器
    const speed = isDeleting ? deleteSpeed : typeSpeed;
    typingTimeoutRef.current = setTimeout(handleTyping, speed);

    // 清理函数：组件卸载时清除定时器
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, isDeleting, loopNum, subtitles, typeSpeed, deleteSpeed, delayAfterTyping]);

  return (
    <span className="typing-effect-text">
      {text}
      <span className="typing-cursor">|</span>
    </span>
  );
};

export default TypingEffect;
