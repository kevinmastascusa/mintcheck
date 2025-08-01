# 🚀 Quick Start Guide - PSA Card PreGrader

## ⚡ Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Navigate to: **http://localhost:3000**

---

## 🎯 How to Use

### Upload a Card
1. **Drag & Drop**: Simply drag your Pokémon card image onto the upload area
2. **Click to Browse**: Or click "Choose File" to select an image
3. **Supported Formats**: JPG, PNG, WEBP (Max 10MB)

### View Results
- **Estimated Grade**: See the predicted PSA grade
- **Component Scores**: Check centering, corners, edges, and surface
- **Probability**: View the likelihood of achieving the grade
- **Market Value**: Get an estimated card value
- **Recommendations**: Read professional advice

### Download Report
Click "Download Report" to save a detailed analysis as a text file.

---

## 📊 What Gets Analyzed

| Component | Weight | What We Check |
|-----------|--------|---------------|
| **Centering** | 25% | Border consistency, image alignment |
| **Corners** | 25% | Corner wear, damage, whitening |
| **Edges** | 25% | Edge condition, chipping, wear |
| **Surface** | 25% | Scratches, print defects, wear |

---

## 🎨 PSA Grading Scale

| Grade | Score | Description |
|-------|-------|-------------|
| **Gem Mint** | 9.5-10.0 | Perfect card |
| **Mint** | 9.0-9.4 | Nearly perfect |
| **Near Mint-Mint** | 8.0-8.9 | Excellent condition |
| **Near Mint** | 7.0-7.9 | Very good condition |
| **Excellent-Mint** | 6.0-6.9 | Good condition |
| **Excellent** | 5.0-5.9 | Above average |
| **Very Good-Excellent** | 4.0-4.9 | Average condition |
| **Very Good** | 3.0-3.9 | Below average |
| **Good-Very Good** | 2.0-2.9 | Poor condition |
| **Good** | 1.0-1.9 | Very poor |
| **Poor** | 0.0-0.9 | Severely damaged |

---

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is available
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Image Upload Issues
- Ensure file is under 10MB
- Use JPG, PNG, or WEBP format
- Check image quality (higher resolution = better analysis)

### Analysis Takes Too Long
- Reduce image size before uploading
- Ensure good lighting in the original photo
- Close other applications to free up memory

---

## 📱 Tips for Best Results

### Image Quality
- **High Resolution**: Use images with at least 1000px width
- **Good Lighting**: Ensure card is well-lit without glare
- **Clean Background**: Use a solid, contrasting background
- **Sharp Focus**: Avoid blurry or out-of-focus images

### Card Positioning
- **Centered**: Place card in the center of the frame
- **Flat Surface**: Avoid curved or bent cards
- **No Shadows**: Minimize shadows and reflections
- **Full Card**: Include the entire card in the image

---

## ⚠️ Important Notes

- **Estimates Only**: This tool provides estimates, not official PSA grades
- **Professional Grading**: Always consult PSA for official assessments
- **Market Values**: Estimated values are approximate and may vary
- **Image Privacy**: Uploaded images are processed locally and not stored

---

## 🆘 Need Help?

- **Check the README.md** for detailed documentation
- **Review the console** for error messages
- **Restart the server** if issues persist
- **Try a different image** if analysis fails

---

**Happy Card Grading! 🎴✨** 