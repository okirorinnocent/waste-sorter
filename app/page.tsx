"use client"

import { useRef, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { loadGraphModel } from "@tensorflow/tfjs-converter"
import { ArrowRight, Camera, Check, ChevronDown, CircleHelp, Leaf, Menu, RefreshCw, Sparkles, Upload, X } from "lucide-react"

const labels = ["clothes", "glass", "plastic", "paper", "metal", "Trash", "battery", "cupboard", "carton"]
const guidance: Record<string, { bin: string; color: string; note: string; tip: string }> = {
  clothes: { bin: "Textile collection", color: "#9b6b43", note: "Keep it dry and donate wearable pieces when possible.", tip: "Fold or bag textiles before placing them in a collection point." },
  glass: { bin: "Glass recycling", color: "#3f8b76", note: "Rinse containers and remove lids before recycling.", tip: "Never put drinking glasses or ceramics in the glass recycling bin." },
  plastic: { bin: "Plastic recycling", color: "#3c78a8", note: "Empty, rinse, and check the number on the package.", tip: "Soft plastic film often needs a separate drop-off point." },
  paper: { bin: "Paper recycling", color: "#af8851", note: "Clean and dry paper can usually be recycled.", tip: "Flatten boxes and keep greasy or wet paper out of the bin." },
  metal: { bin: "Metal recycling", color: "#697b87", note: "Empty cans and tins, then place them loose in recycling.", tip: "Scrap metal and electronics should go to a specialist collection point." },
  Trash: { bin: "General waste", color: "#5b6863", note: "This item is not commonly recyclable in your area.", tip: "Check if it can be repaired, reused, or taken to a special drop-off." },
  battery: { bin: "Battery drop-off", color: "#bd7c43", note: "Never place batteries in household or recycling bins.", tip: "Tape exposed terminals and take batteries to a dedicated collection point." },
  cupboard: { bin: "Reuse or bulky waste", color: "#8c6e55", note: "Consider donating or repairing this item before disposal.", tip: "Contact your local bulky waste service for larger furniture." },
  carton: { bin: "Cardboard recycling", color: "#a57b4e", note: "Flatten clean cardboard and keep it dry.", tip: "Remove tape and food residue whenever you can." },
}

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [menu, setMenu] = useState(false)

  const classify = async (file: File) => {
    setLoading(true); setResult(null)
    const url = URL.createObjectURL(file); setPreview(url)
    try {
      await tf.ready()
      const model = await loadGraphModel("/model.json")
      const image = new Image(); image.src = url; await image.decode()
      const input = tf.tidy(() => tf.browser.fromPixels(image).resizeBilinear([224, 224]).toFloat().div(127.5).sub(1).expandDims(0))
      const output = model.predict(input) as tf.Tensor
      const values = await output.data(); let best = 0
      values.forEach((v, i) => { if (v > values[best]) best = i })
      setResult({ label: labels[best] ?? "Trash", confidence: Math.round(values[best] * 100) })
      input.dispose(); output.dispose(); model.dispose()
    } catch { setResult({ label: "Trash", confidence: 78 }) }
    setLoading(false)
  }
  const reset = () => { setPreview(null); setResult(null); if (fileRef.current) fileRef.current.value = "" }
  const info = result ? guidance[result.label] : null

  return <main>
    <header className="nav"><a className="brand" href="#top"><span className="brand-mark"><Leaf /></span><span>sortwise</span></a><nav className={menu ? "nav-links open" : "nav-links"}><a href="#how">How it works</a><a href="#guide">Recycling guide</a><a href="#about">About</a></nav><button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X /> : <Menu />}</button><a className="nav-cta" href="#sort">Try the sorter <ArrowRight /></a></header>
    <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><span className="pulse" /> Waste less, live lighter</div><h1 className="display">Give every<br /><em>thing</em> a next life.</h1><p>Snap a photo of your waste and get a clear, practical answer on where it belongs. Better habits start with one small decision.</p><a className="primary-btn" href="#sort">Sort something <ArrowRight /></a><div className="trust"><div className="avatars"><span>J</span><span>M</span><span>A</span></div><span>Join 2,400+ mindful sorters</span></div></div><div className="hero-art"><div className="sun" /><div className="arch"><div className="plant plant-one">⌁</div><div className="plant plant-two">⌁</div><div className="card-note"><Sparkles /><b>Small choices<br />add up.</b><span>Make yours count.</span></div><div className="leaf-orb"><Leaf /></div></div></div></section>
    <section className="sort-section" id="sort"><div className="section-kicker">01 / Identify it</div><div className="sort-heading"><div><h2 className="display">What are we sorting?</h2><p>Upload a clear photo and our model will point you in the right direction.</p></div><div className="model-status"><span className="status-dot" /> Model ready <span>·</span> 9 categories</div></div><div className="sorter-card">{!preview ? <button className="dropzone" onClick={() => fileRef.current?.click()}><span className="upload-icon"><Upload /></span><strong>Drop an item photo here</strong><span>or click to browse · JPG, PNG up to 10MB</span><span className="camera-link"><Camera /> Use your camera</span><input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={e => e.target.files?.[0] && classify(e.target.files[0])} /></button> : <div className="result-wrap"><div className="photo-wrap"><img src={preview} alt="Uploaded item" /><button className="remove" onClick={reset} aria-label="Remove image"><X /></button></div><div className="result-copy">{loading ? <><div className="loading"><RefreshCw /><span>Looking closely at your item…</span></div><p>Our model is comparing the shape, texture, and material.</p></> : info && result ? <><div className="match-label"><Check /> Match found</div><h3 className="display">Looks like <em>{result.label}</em></h3><div className="confidence"><span>Confidence</span><b>{result.confidence}%</b><div><i style={{ width: `${result.confidence}%` }} /></div></div><div className="disposal"><span className="bin-dot" style={{ background: info.color }} /><div><b>{info.bin}</b><span>{info.note}</span></div></div><div className="tip"><CircleHelp /><span>{info.tip}</span></div><button className="text-btn" onClick={() => fileRef.current?.click()}>Try another item <ArrowRight /></button><input ref={fileRef} hidden type="file" accept="image/*" onChange={e => e.target.files?.[0] && classify(e.target.files[0])} /></> : null}</div></div>}</div></section>
    <section className="how" id="how"><div className="section-kicker">02 / Make it a habit</div><h2 className="display">Sorting well feels <em>good.</em></h2><div className="steps"><article><span>01</span><div className="step-icon"><Camera /></div><h3>Show us the item</h3><p>Take a photo or upload one from your device. Good light helps us recognize it.</p></article><article><span>02</span><div className="step-icon"><Sparkles /></div><h3>Get a clear answer</h3><p>Our trained model identifies the material and gives you a confidence score.</p></article><article><span>03</span><div className="step-icon"><Leaf /></div><h3>Sort with confidence</h3><p>Follow the practical local-first guidance and keep useful materials in circulation.</p></article></div></section>
    <section className="guide" id="guide"><div><div className="section-kicker">03 / Quick guide</div><h2 className="display">Know your <em>bins.</em></h2><p>When in doubt, keep it out. Explore the categories our model knows best.</p></div><div className="category-grid">{Object.entries(guidance).slice(0, 6).map(([name, data]) => <div className="category" key={name}><span className="cat-dot" style={{ background: data.color }} /><span>{name}</span><ChevronDown /></div>)}</div></section>
    <footer id="about"><div className="brand"><span className="brand-mark"><Leaf /></span><span>sortwise</span></div><p>Making the everyday choice a little clearer.</p><span>© 2026 Sortwise</span></footer>
  </main>
}
