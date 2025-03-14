/**
 * SVG验证和修复工具函数
 * 用于自动检测和修复SVG代码中常见的显示问题
 */

/**
 * 验证并修复SVG代码
 * @param {string} svgCode - 原始SVG代码
 * @returns {string} - 修复后的SVG代码
 */
function validateAndFixSVG(svgCode) {
    if (!svgCode || !svgCode.trim()) {
        return svgCode;
    }
    
    let fixedSVG = svgCode.trim();
    
    // 1. 检查并添加XML声明
    if (!fixedSVG.includes('<?xml version')) {
        fixedSVG = '<?xml version="1.0" encoding="UTF-8"?>\n' + fixedSVG;
    }
    
    // 2. 提取viewBox尺寸并确保width和height属性存在
    const viewBoxMatch = fixedSVG.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch && viewBoxMatch[1]) {
        const viewBoxValues = viewBoxMatch[1].split(/\s+/);
        if (viewBoxValues.length === 4) {
            const width = viewBoxValues[2];
            const height = viewBoxValues[3];
            
            // 查找SVG标签
            const svgTagMatch = fixedSVG.match(/<svg[^>]*>/);
            if (svgTagMatch) {
                const svgTag = svgTagMatch[0];
                let newSvgTag = svgTag;
                
                // 添加width属性（如果不存在）
                if (!svgTag.includes('width=')) {
                    newSvgTag = newSvgTag.replace(/<svg/, `<svg width="${width}"`);
                }
                
                // 添加height属性（如果不存在）
                if (!svgTag.includes('height=')) {
                    newSvgTag = newSvgTag.replace(/<svg/, `<svg height="${height}"`);
                }
                
                fixedSVG = fixedSVG.replace(svgTag, newSvgTag);
            }
        }
    }
    
    // 3. 确保存在xmlns属性
    if (!fixedSVG.includes('xmlns=')) {
        fixedSVG = fixedSVG.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // 4. 转义特殊字符 - 移除此部分，因为对于innerHTML设置会导致问题
    // 只转义未转义的&符号，保留其他特殊字符不变
    fixedSVG = fixedSVG
        .replace(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g, '&amp;'); // 只替换未转义的&为&amp;
    
    // 5. 将"KingHwa_OldSong"等自定义字体替换为通用字体（可选）
    // 注意：可能需要根据实际需求调整这部分逻辑
    const customFonts = ['KingHwa_OldSong'];
    for (const font of customFonts) {
        const fontRegex = new RegExp(`font-family=["']${font}`, 'g');
        fixedSVG = fixedSVG.replace(fontRegex, 'font-family="Arial, sans-serif');
    }
    
    // 6. 修复不一致的大小写颜色值（例如#Ffffff）
    fixedSVG = fixedSVG.replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g, match => match.toLowerCase());
    
    return fixedSVG;
}

// 明确将函数暴露给全局作用域
if (typeof window !== 'undefined') {
    window.validateAndFixSVG = validateAndFixSVG;
}

// 同时保持模块导出兼容性
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateAndFixSVG };
} 