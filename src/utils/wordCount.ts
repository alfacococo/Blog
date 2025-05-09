export function getWordCount(content: string, options?: { onlyChinese?: boolean }): number {
  if (options?.onlyChinese) {
    const match = content.match(/[\u4e00-\u9fa5]/g);
    return match ? match.length : 0;
  } else {
    const plainText = content.replace(/[#*_>`~\-!\[\]\(\)>\n\r]/g, "").replace(/\s+/g, "");
    return plainText.length;
  }
}

/**
 * 获取预计阅读时间（单位：分钟）
 * @param wordCount 字数
 * @param wordsPerMinute 每分钟阅读字数（默认400）
 */
export function getReadingTime(wordCount: number, wordsPerMinute: number = 400): number {
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
