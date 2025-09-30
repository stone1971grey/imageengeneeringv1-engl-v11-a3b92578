import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail } from "lucide-react";
import emvaLogo from "@/assets/news-emva-1288-logo.png";
import te300Image from "@/assets/news-te300.png";
import iqAnalyzerImage from "@/assets/news-iq-analyzer-x.png";
import geocalImage from "@/assets/news-geocal-xl.png";

const newsArticles = {
  "geometric-camera-calibration": {
    id: 4,
    date: "July 21, 2025",
    headline: "Geometric Camera Calibration",
    teaser: "GEOCAL offers a compact, laser-based solution for geometric calibration, improving accuracy compared to traditional checkerboard targets.",
    image: geocalImage,
    images: [geocalImage],
    content: `
## Introduction

GEOCAL is a camera calibration tool that uses laser technology to project a grid of light spots, enabling precise geometric calibration without traditional test charts. Geometric calibration enhances camera accuracy in industries like automotive and security.

During the product development phase of GEOCAL, we have already involved customers who use other standard geometric calibration methods to develop their products or as a service. These methods are well-established and have been proven to work. In this paper/tech note, we will compare the results of these methods with the results of a geometric calibration performed with the GEOCAL V1.4 software. Version 1.4 is a significant step towards higher flexibility, reliability, and accuracy.

## Camera 1

PhaseOne offers geometric calibration of their cameras to customers involved in, e.g., geospatial imaging, requiring a high degree of accuracy in the data they capture. They were kind enough to provide us with a PhaseOne camera together with their results of the current calibration for comparison.

The data below is the camera and the applied hardware and software.

**Camera:** PhaseOne iXM-RS150F-RS  
**Focal length:** 50 mm  
**Pixel pitch:** 3.76 µm  
**Sensor resolution:** 14204 px * 10652 px  
**GEOCAL used:** GEOCAL XL  
**GEOCAL Software:** V1.4.0  
**Applied distortion model:** Even_Brown_Model

Even though GEOCAL only requires a single image for geometric calibration, we analyzed three images using GEOCAL software to make sure repeatability is given. The focal length is provided in pixels and converted in mm by applying the pixel pitch. The deviation between the methods is based on the average of the three measurements.

### Results

As Phase One states the coefficients of the undistortion function, we cannot directly compare the distortion coefficients calculated by GEOCAL Software. Still, we can compare the acquired focal length and principal point.

We can see that the difference between both methods regarding focal length and principal point is small. In addition, the Root Mean Square Error (RMSE) value is a fraction of a pixel, which shows that the reprojected grid is very close to the actual detected grid. The RMSE represents the average offset from detected points to the reprojected points in pixels and is the most significant indicator for good geometric characterization.

## Camera 2

An automotive customer provided a golden sample camera with known reference data for this comparison.

The data below is the camera and the applied hardware and software.

**Camera:** Leopard Imaging  
**The angle of view:** approx. 120°  
**Sensor resolution:** 3840 px * 2160 px  
**GEOCAL used:** GEOCAL XL  
**GEOCAL SW:** V1.4.0  
**Applied distortion model:** Custom  
**Number of variant coefficients:** 4

### Results

We took four images, analyzed them with our GEOCAL software, and found that the focal point and focal length also showed little deviation. Again, the deviation between the methods is based on the average of all four GEOCAL measurements.

Having the focal length and the principal point correct, we got everything we need for the intrinsic camera matrix, which is crucial for valid undistortion. The distortion coefficients at that point in the development phase were not yet comparable.

## Camera 3 - Checkerboard vs. GEOCAL

We also compared the GEOCAL Calibration with the well-known OpenCV Checkerboard calibration based on our TE251 distortion chart analysis to get a better impression of the performance.

The data below is the camera and the applied hardware and software.

**Camera:** Canon Powershot G5 X  
**Focal length:** 9 mm  
**Sensor resolution:** 5536px * 3693 px  
**GEOCAL used:** GEOCAL XL (SN: GC-10004)  
**GEOCAL SW:** V1.4.1  
**Applied distortion model:** Even_Brown_Model  
**Test chart for validation:** TE251  
**Analysis Software:** iQ-Analyzer-X 1.9

The first step was to take a picture of the GEOCAL XL. To ensure that the dots were clearly visible, we reduced the exposure time as much as possible, set the ISO to its lowest setting, and set the aperture to 11. Then, we ensured that the rotation was as low as possible by keeping the 0th order, the brightest dot, in the image center and the camera horizontally with a spirit level.

The image seems to be underexposed, but this is a result of the small size of the dots, which is expected. We analyzed it with GEOCAL Software 1.4.1, applying the following configuration.

**Distortion Model:** Even_Brown_Model  
**Number of radial coefficients:** 3  
**Number of tangential coefficients:** 0 (these are more applicable in the case of a decentered or misaligned lens)

The next step was to perform the OpenCV checkerboard calibration.

To start the checkerboard calibration, we need at least ten images from a squared checkerboard pattern with a defined number of squares.

We used an example script from the OpenCV documentation for the checkerboard calibration.

OpenCV correctly detected all points. The calibration took around 5 seconds with the GEOCAL software and 95 seconds with the OpenCV code on the same PC.

After both calibrations, the intrinsic parameters and the distortion coefficients were calculated. These parameters are all we need to undistort the image of the TE251. We did the undistortion with the GEOCAL and Checkerboard parameters in Python using the OpenCV undistort() function.

Visually slight differences are noticeable in the corners. We can get a better impression of the performance by measuring the remaining distortion in these undistorted images with iQ-Analyzer-X.

Both methods show Local Geometric Distortion (LGD) close to zero up to 70% of the field; above 70%, the GEOCAL performs better. The lines in the plot above represent the average LGD for a specific radius/field. Imagine it is the LGD of all detected crosses in the TE251 with the same radius. To learn more about the calculation of LGD, which is a part of ISO17850, visit our website library - distortion.

The 2D plot provides a good overview of the distortion distribution over the entire image field. However, the alignment between the camera and the chart is a huge factor in the appearance of both plots.

Please note that we did not use the tangential coefficients in the GEOCAL calibration, while the Checkerboard calibration does apply them. We noticed that leaving out the tangential coefficients in this case leads to better results, visually and objectively.

## Summary

In the first two examples, the GEOCAL calibration proved to be quite accurate in finding the focal length and principal point, which are the crucial parameters of the intrinsic camera matrix. The Checkerboard vs. GEOCAL comparison shows similar results to the OpenCV Checkerboard calibration when using OpenCV's undistortion algorithm. It performs better in terms of ease of use because it does not require as many images to be captured. One properly exposed and aligned image is enough. Also, it requires much less space for its setup. However, to use the GEOCAL calibration, the camera must be able to focus on infinity or at least close to infinity to provide sharp points. It should also be possible to adjust the exposure to avoid saturation of the points. The time required for calibration was much less with GEOCAL, making it very interesting for applications requiring speed, high throughput, and precision.
    `
  },
  "emva-1288-iso-24942": {
    id: 1,
    date: "July 21, 2025",
    headline: "EMVA 1288 becoming ISO 24942",
    teaser: "Dietmar Wueller is leading the international effort to migrate EMVA 1288 into ISO 24942, enhancing global standards for image quality testing.",
    image: emvaLogo,
    images: [emvaLogo],
    content: `
## Introduction

The European Machine Vision Association (EMVA) 1288 standard has been a cornerstone of machine vision camera characterization for years. Now, under the leadership of Dietmar Wueller, this standard is being elevated to the international stage as ISO 24942.

## The Importance of EMVA 1288

EMVA 1288 provides a standardized methodology for characterizing and comparing digital cameras used in machine vision applications. The standard defines precise measurement procedures for:

- Quantum efficiency
- Temporal dark noise
- Linearity
- Dynamic range
- Signal-to-noise ratio

## Transition to ISO 24942

The migration to ISO 24942 represents a significant milestone in the standardization of machine vision technology. This transition ensures:

- Global recognition and acceptance
- Enhanced technical specifications
- Broader industry adoption
- Improved interoperability between systems

## Benefits for the Industry

The establishment of ISO 24942 brings numerous advantages:

- **Universal Standard**: A single, internationally recognized measurement methodology
- **Quality Assurance**: Consistent quality benchmarks across manufacturers
- **Reduced Complexity**: Simplified procurement and comparison processes
- **Future-Proof**: A foundation for emerging technologies

## Expert Leadership

Dietmar Wueller's expertise in image quality assessment and standardization has been instrumental in this transition. His work ensures that the technical rigor of EMVA 1288 is preserved while meeting the requirements of an international standard.

## Conclusion

The evolution of EMVA 1288 into ISO 24942 marks a new era for machine vision standards, providing a robust framework for camera characterization that will benefit manufacturers, integrators, and end-users worldwide.
    `
  },
  "te300-skin-tone-chart": {
    id: 2,
    date: "June 20, 2025",
    headline: "TE300 – A new skin tone test chart",
    teaser: "Introducing the TE300 Skin Tone Checker: a modern tool for assessing skin tone accuracy in camera systems with real-world spectral data.",
    image: te300Image,
    images: [te300Image],
    content: `
## Introduction

The TE300 Skin Tone Checker represents a breakthrough in accurate skin tone reproduction testing for camera systems. Built on real-world spectral data, this test chart addresses the growing demand for inclusive and accurate color representation across diverse skin tones.

## The Need for Better Skin Tone Testing

Traditional color charts often fail to adequately represent the full spectrum of human skin tones. The TE300 addresses this gap by providing:

- A comprehensive range of skin tone samples
- Spectral accuracy based on real measurements
- Representation of global diversity
- Standardized reference for camera calibration

## Technical Specifications

The TE300 is designed with precision and accuracy in mind:

- **Spectral Coverage**: Full visible spectrum (380-780nm)
- **Tone Range**: 24 carefully selected skin tone patches
- **Reference Standard**: Based on spectrophotometric measurements
- **Material**: High-quality, stable pigments
- **Durability**: Long-term color stability

## Applications

The TE300 Skin Tone Checker is ideal for:

- **Mobile Device Cameras**: Ensuring accurate selfie and portrait modes
- **Professional Photography**: Calibrating cameras for diverse subjects
- **Cosmetics Industry**: Product photography and virtual try-on
- **Medical Imaging**: Dermatology and telemedicine applications
- **Film and Broadcasting**: Consistent skin tone reproduction

## Testing Methodology

Using the TE300 involves:

1. Proper illumination setup (D65 or LED equivalent)
2. Accurate white balance calibration
3. Capture of the test chart
4. Analysis using iQ-Analyzer-X software
5. Comparison against reference values

## Industry Impact

The introduction of the TE300 addresses critical industry needs:

- **Inclusivity**: Better representation of all skin tones
- **Accuracy**: Improved color science for portrait photography
- **Standardization**: A common reference for manufacturers
- **Quality Control**: Consistent testing across production

## Conclusion

The TE300 Skin Tone Checker sets a new standard for skin tone accuracy testing, enabling camera manufacturers and content creators to ensure inclusive and accurate color reproduction across all applications.
    `
  },
  "iq-analyzer-x-ai": {
    id: 3,
    date: "May 27, 2025",
    headline: "AI-powered image quality analysis software",
    teaser: "The iQ-Analyzer-X introduces advanced AI-powered tools for chart detection, automation, and video file analysis to streamline workflows.",
    image: iqAnalyzerImage,
    images: [iqAnalyzerImage],
    content: `
## Introduction

The latest version of iQ-Analyzer-X represents a quantum leap in image quality analysis technology. By integrating artificial intelligence and machine learning, this powerful software platform transforms complex analysis tasks into automated, efficient workflows.

## AI-Powered Features

### Automatic Chart Detection

Gone are the days of manual region selection. iQ-Analyzer-X now automatically:

- Detects test charts in images
- Identifies chart type and orientation
- Adjusts for perspective distortion
- Handles multiple charts in a single frame

### Intelligent Analysis

The AI engine provides:

- Automatic parameter optimization
- Anomaly detection in test results
- Trend analysis across test batches
- Predictive quality assessment

## Video Analysis Capabilities

A major addition to iQ-Analyzer-X is comprehensive video analysis:

- **Frame-by-frame Analysis**: Automated extraction and evaluation
- **Temporal Consistency**: Motion blur and stabilization assessment
- **Performance Metrics**: Rolling shutter, latency, and frame drops
- **Batch Processing**: Efficient handling of large video files

## Workflow Automation

### Batch Processing

Process hundreds of images with:

- Automatic file detection and sorting
- Parallel processing for speed
- Customizable analysis pipelines
- Automated report generation

### Integration Capabilities

iQ-Analyzer-X now offers:

- REST API for third-party integration
- Python SDK for custom workflows
- Database connectivity for QA systems
- Cloud deployment options

## Enhanced User Interface

The new interface features:

- Intuitive drag-and-drop functionality
- Real-time preview of analysis results
- Customizable dashboards
- Interactive visualization tools

## Performance Improvements

Technical enhancements include:

- 5x faster processing speed
- GPU acceleration support
- Reduced memory footprint
- Multi-threading optimization

## Industry Applications

The AI-powered iQ-Analyzer-X excels in:

- **Automotive**: ADAS camera validation at scale
- **Mobile**: High-volume smartphone testing
- **Security**: Surveillance camera certification
- **Research**: Academic and R&D projects

## Machine Learning Models

The software utilizes:

- Convolutional Neural Networks for chart detection
- Ensemble methods for quality prediction
- Adaptive algorithms for various lighting conditions
- Continuous learning from user feedback

## Future Roadmap

Upcoming features include:

- Cloud-based collaborative analysis
- Real-time streaming analysis
- Extended AI model training
- Integration with popular CI/CD pipelines

## Conclusion

iQ-Analyzer-X with AI represents the future of image quality testing—faster, smarter, and more efficient than ever before. By automating repetitive tasks and providing intelligent insights, it enables engineers and quality professionals to focus on innovation rather than analysis.
    `
  }
};

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const article = slug ? newsArticles[slug as keyof typeof newsArticles] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Article not found</h1>
          <Link to="/news">
            <Button variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse markdown-style content to JSX
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let key = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={key++} className="text-gray-700 leading-relaxed mb-6">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={key++} className="text-3xl font-bold text-gray-900 mb-6 mt-12">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={key++} className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        flushParagraph();
        const parts = line.split('**');
        if (parts.length >= 3) {
          elements.push(
            <div key={key++} className="mb-3">
              <span className="font-semibold text-gray-900">{parts[1]}</span>
              <span className="text-gray-700"> {parts[2]}</span>
            </div>
          );
        }
      } else if (line.startsWith('- **')) {
        flushParagraph();
        const text = line.substring(2);
        elements.push(
          <li key={key++} className="text-gray-700 mb-2">
            {text}
          </li>
        );
      } else if (line.startsWith('- ')) {
        flushParagraph();
        elements.push(
          <li key={key++} className="text-gray-700 mb-2">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line.trim());
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Article Header */}
      <article className="pt-48 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/news" className="inline-flex items-center text-[#0f407b] hover:text-[#0d3468] mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>

            {/* Article Meta */}
            <div className="text-sm text-gray-500 mb-4 font-medium">
              {article.date}
            </div>

            {/* Article Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.headline}
            </h1>

            {/* Article Teaser */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.teaser}
            </p>

            {/* Subtitle for Geometric Calibration */}
            {slug === 'geometric-camera-calibration' && (
              <h2 className="text-2xl font-semibold text-gray-800 mb-12">
                A Comparison with Currently Established Geometric Calibration Methods
              </h2>
            )}

            {/* Featured Image */}
            <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={article.image} 
                alt={article.headline}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(article.content)}
            </div>

            {/* Contact Section */}
            <div className="mt-16 p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact us</h3>
              <p className="text-gray-700 mb-6">
                Contact us at <a href="mailto:sales@image-engineering.de" className="text-[#0f407b] hover:underline font-medium">sales@image-engineering.de</a> for more information.
              </p>
              <div className="flex gap-4">
                <Button 
                  className="bg-[#0f407b] text-white hover:bg-[#0d3468]"
                  onClick={() => window.location.href = 'mailto:sales@image-engineering.de'}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Sales
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Navigation to other articles */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link to="/news">
                <Button variant="outline" className="w-full md:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  View all news articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default NewsDetail;
