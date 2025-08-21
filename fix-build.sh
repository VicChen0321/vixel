#!/bin/bash

echo "🔧 修正 Vite 建置結構..."

# 檢查是否存在錯誤的目錄結構
if [ -d "dist/renderer/src/renderer" ]; then
    echo "📁 發現錯誤的目錄結構，正在修正..."
    
    # 移動檔案到正確位置
    mv dist/renderer/src/renderer/* dist/renderer/
    
    # 刪除空目錄
    rmdir dist/renderer/src/renderer
    rmdir dist/renderer/src
    
    echo "✅ 目錄結構已修正"
else
    echo "✅ 目錄結構正確"
fi

# 修正 HTML 檔案中的路徑
echo "🔧 修正 HTML 檔案路徑..."

# 修正圖示路徑
sed -i '' 's|href="/vite.svg"|href="./vite.svg"|g' dist/renderer/index.html

# 修正 JavaScript 路徑
sed -i '' 's|src="/index.js"|src="./index.js"|g' dist/renderer/index.html
sed -i '' 's|src="/assets/index-[^"]*\.js"|src="./index.js"|g' dist/renderer/index.html

echo "✅ HTML 路徑已修正"
echo "🎉 修正完成！"
