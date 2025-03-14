document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化应用...');
    
    // 检查SVG验证函数是否可用
    if (typeof window.validateAndFixSVG !== 'function') {
        console.error('警告: SVG验证函数不可用，使用空函数替代');
    }
    
    // 引入SVG验证工具（确保svg-validator.js已加载）
    let validateSVG = window.validateAndFixSVG || function(svg) { 
        console.log('使用替代SVG验证函数');
        return svg; 
    };
    
    // 初始化编辑器
    const editor = CodeMirror.fromTextArea(document.getElementById('svg-code'), {
        mode: 'xml',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        matchTags: {bothTags: true},
        lineWrapping: true
    });

    // 示例SVG代码
    const exampleSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="10" y="10" width="180" height="180" fill="none" stroke="#333" stroke-width="2" rx="10" ry="10"/>
  <circle cx="100" cy="100" r="50" fill="#4a6cf7"/>
  <text x="100" y="180" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#333">测试SVG</text>
</svg> `;

    // 获取各元素
    const exampleBtn = document.getElementById('example-btn');
    const svgPreview = document.getElementById('svg-preview');
    const zoomSelect = document.getElementById('zoom-select');
    const bgColor = document.getElementById('bg-color');
    const transparentBg = document.getElementById('transparent-bg');
    const formatSelect = document.getElementById('format-select');
    const scaleSelect = document.getElementById('scale-select');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const exportBtn = document.getElementById('export-btn');
    const copyBtn = document.getElementById('copy-btn');
    const previewContainer = document.getElementById('preview-container');

    // 加载示例代码
    exampleBtn.addEventListener('click', function() {
        editor.setValue(exampleSVG);
        updatePreview();
    });

    // 初始化
    editor.on('change', updatePreview);
    zoomSelect.addEventListener('change', applyZoom);
    bgColor.addEventListener('input', updateBackground);
    transparentBg.addEventListener('change', updateBackground);
    exportBtn.addEventListener('click', exportImage);
    copyBtn.addEventListener('click', copyImageToClipboard);

    // 初始化示例代码
    if (!editor.getValue()) {
        editor.setValue(exampleSVG);
    }
    updatePreview();

    // 更新SVG预览
    function updatePreview() {
        const svgCode = editor.getValue().trim();
        
        if (svgCode) {
            try {
                console.log('更新预览，原始SVG代码长度:', svgCode.length);
                
                // 验证并修复SVG代码
                const fixedSVG = validateSVG(svgCode);
                console.log('SVG代码已修复，新长度:', fixedSVG.length);
                
                // 如果代码被修复，更新编辑器（可选）
                if (fixedSVG !== svgCode) {
                    console.log('SVG代码已修改');
                    // 如果希望自动更新编辑器内容，取消下面的注释
                    // editor.setValue(fixedSVG);
                    // return; // 更新编辑器会触发change事件，所以这里可以直接返回
                }
                
                // 清空预览区域
                svgPreview.innerHTML = '';
                
                // 使用DOMParser解析SVG代码，而不是直接使用innerHTML
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(fixedSVG, 'image/svg+xml');
                
                // 检查解析错误
                const parserError = svgDoc.querySelector('parsererror');
                if (parserError) {
                    console.error('SVG解析错误:', parserError.textContent);
                    svgPreview.innerHTML = '<div class="error">SVG解析错误，请检查代码</div>';
                    return;
                }
                
                // 获取SVG元素
                const svgElement = svgDoc.documentElement;
                
                // 将SVG元素添加到DOM中
                svgPreview.appendChild(document.importNode(svgElement, true));
                
                // 确保SVG可见
                const addedSvgElement = svgPreview.querySelector('svg');
                if (addedSvgElement) {
                    console.log('SVG元素成功创建，设置样式');
                    // 确保SVG可见，添加明确的尺寸
                    addedSvgElement.style.display = 'block';
                    addedSvgElement.style.margin = '0 auto';
                    
                    // 自动填充宽高输入框
                    if (addedSvgElement.hasAttribute('width') && addedSvgElement.hasAttribute('height')) {
                        const width = addedSvgElement.getAttribute('width').replace(/[^0-9]/g, '');
                        const height = addedSvgElement.getAttribute('height').replace(/[^0-9]/g, '');
                        
                        widthInput.placeholder = width || '自动';
                        heightInput.placeholder = height || '自动';
                    }
                    
                    // 应用缩放
                    applyZoom();
                } else {
                    console.error('SVG元素创建失败，无法在DOM中找到SVG元素');
                    svgPreview.innerHTML = '<div class="error">SVG元素无法创建，请检查代码</div>';
                }
                
                // 更新背景
                updateBackground();
            } catch (error) {
                console.error('SVG渲染错误:', error);
                svgPreview.innerHTML = '<div class="error">SVG渲染错误: ' + error.message + '</div>';
            }
        } else {
            svgPreview.innerHTML = '<div class="hint">请输入或粘贴SVG代码</div>';
        }
    }

    // 应用缩放
    function applyZoom() {
        const zoom = parseFloat(zoomSelect.value);
        const svgElement = svgPreview.querySelector('svg');
        
        if (svgElement) {
            // 更改缩放中心点和方式
            svgElement.style.transformOrigin = 'center center';
            svgElement.style.transform = `scale(${zoom})`;
            
            // 确保父容器能正确显示缩放后的内容
            if (zoom > 1) {
                previewContainer.style.overflow = 'auto';
            } else {
                previewContainer.style.overflow = 'visible';
            }
        }
    }

    // 更新背景颜色
    function updateBackground() {
        if (transparentBg.checked) {
            previewContainer.style.backgroundColor = 'transparent';
        } else {
            previewContainer.style.backgroundColor = bgColor.value;
        }
    }

    // 导出图片
    function exportImage() {
        const svgCode = editor.getValue().trim();
        
        if (!svgCode) {
            alert('请先输入有效的SVG代码');
            return;
        }
        
        try {
            // 验证并修复SVG代码
            const fixedSVG = validateSVG(svgCode);
            
            // 创建SVG文档
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(fixedSVG, 'image/svg+xml');
            
            // 检查解析错误
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) {
                alert('SVG解析错误，请检查代码');
                return;
            }
            
            // 获取SVG元素
            const svgElement = svgDoc.documentElement;
            
            // 获取导出设置
            const format = formatSelect.value;
            const scale = parseFloat(scaleSelect.value);
            
            // 获取SVG尺寸
            let width = svgElement.getAttribute('width');
            let height = svgElement.getAttribute('height');
            
            // 移除单位，只保留数字
            width = width ? parseFloat(width.replace(/[^0-9.]/g, '')) : 300;
            height = height ? parseFloat(height.replace(/[^0-9.]/g, '')) : 150;
            
            // 使用用户指定的尺寸（如果有）
            const customWidth = widthInput.value ? parseInt(widthInput.value) : width;
            const customHeight = heightInput.value ? parseInt(heightInput.value) : height;
            
            // 计算导出尺寸
            const exportWidth = Math.round(customWidth * scale);
            const exportHeight = Math.round(customHeight * scale);
            
            // 创建Canvas
            const canvas = document.createElement('canvas');
            canvas.width = exportWidth;
            canvas.height = exportHeight;
            const ctx = canvas.getContext('2d');
            
            // 设置背景（如果不是透明）
            if (!transparentBg.checked) {
                ctx.fillStyle = bgColor.value;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // 转换SVG为图片
            const img = new Image();
            const svgBlob = new Blob([fixedSVG], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
                URL.revokeObjectURL(url);
                
                // 导出图片
                const dataURL = canvas.toDataURL(`image/${format}`, 0.95);
                
                // 创建下载链接
                const link = document.createElement('a');
                link.download = `image.${format}`;
                link.href = dataURL;
                link.click();
            };
            
            img.src = url;
        } catch (error) {
            alert('导出失败: ' + error.message);
        }
    }
    
    // 复制图片到剪贴板
    function copyImageToClipboard() {
        const svgCode = editor.getValue().trim();
        
        if (!svgCode) {
            alert('请先输入有效的SVG代码');
            return;
        }
        
        try {
            // 验证并修复SVG代码
            const fixedSVG = validateSVG(svgCode);
            
            // 创建SVG文档
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(fixedSVG, 'image/svg+xml');
            
            // 检查解析错误
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) {
                alert('SVG解析错误，请检查代码');
                return;
            }
            
            // 获取SVG元素
            const svgElement = svgDoc.documentElement;
            
            // 获取导出设置
            const format = 'png'; // 固定使用PNG格式复制到剪贴板
            const scale = parseFloat(scaleSelect.value);
            
            // 获取SVG尺寸
            let width = svgElement.getAttribute('width');
            let height = svgElement.getAttribute('height');
            
            // 移除单位，只保留数字
            width = width ? parseFloat(width.replace(/[^0-9.]/g, '')) : 300;
            height = height ? parseFloat(height.replace(/[^0-9.]/g, '')) : 150;
            
            // 使用用户指定的尺寸（如果有）
            const customWidth = widthInput.value ? parseInt(widthInput.value) : width;
            const customHeight = heightInput.value ? parseInt(heightInput.value) : height;
            
            // 计算导出尺寸
            const exportWidth = Math.round(customWidth * scale);
            const exportHeight = Math.round(customHeight * scale);
            
            // 创建Canvas
            const canvas = document.createElement('canvas');
            canvas.width = exportWidth;
            canvas.height = exportHeight;
            const ctx = canvas.getContext('2d');
            
            // 设置背景（如果不是透明）
            if (!transparentBg.checked) {
                ctx.fillStyle = bgColor.value;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // 转换SVG为图片
            const img = new Image();
            const svgBlob = new Blob([fixedSVG], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
                URL.revokeObjectURL(url);
                
                // 将图片转换为Blob
                canvas.toBlob(function(blob) {
                    try {
                        // 尝试使用新的Clipboard API
                        navigator.clipboard.write([
                            new ClipboardItem({
                                'image/png': blob
                            })
                        ]).then(() => {
                            alert('图片已复制到剪贴板');
                        }).catch(err => {
                            console.error('复制失败:', err);
                            alert('复制失败，您的浏览器可能不支持此功能');
                        });
                    } catch (error) {
                        console.error('复制到剪贴板失败:', error);
                        alert('复制失败，您的浏览器可能不支持此功能');
                    }
                }, 'image/png');
            };
            
            img.src = url;
        } catch (error) {
            alert('复制失败: ' + error.message);
        }
    }
    
    console.log('应用初始化完成');
}); 