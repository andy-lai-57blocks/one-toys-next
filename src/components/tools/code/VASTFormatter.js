'use client';

import React, { useState } from 'react';
import SimpleAd from '../../ads/SimpleAdSSG';
import CodeEditor from '../../common/CodeEditor';
import { downloadAsFile } from '../../../utils/downloadUtils';
import { unescapeForVAST } from '../../../utils/unescapeUtils';


// Removed fallback themes - now using Ace Editor built-in themes

const VASTFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState(null);

  const [autoUnescape, setAutoUnescape] = useState(true);

  // Helper function to prepare input for processing with enhanced unescaping
  const prepareInput = (rawInput) => {
    if (!autoUnescape || !rawInput) return rawInput;
    
    return unescapeForVAST(rawInput);
  };


  const formatVAST = (xml) => {
    try {
      // Use DOMParser for proper XML parsing
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml.trim(), "application/xml");
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        // Fallback to simple formatting if parsing fails
        return xml.trim();
      }
      
      // Format the XML using the DOM structure
      const formatNode = (node, indent = 0) => {
        const indentStr = '  '.repeat(indent);
        let result = '';
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName;
          const attributes = [];
          
          // Collect attributes
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            attributes.push(`${attr.name}="${attr.value}"`);
          }
          
          const attrStr = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
          
          // Check if element has only text content (no child elements)
          const hasOnlyTextContent = node.childNodes.length === 1 && 
                                   node.childNodes[0].nodeType === Node.TEXT_NODE;
          
          if (hasOnlyTextContent) {
            // Single line for elements with only text content
            const textContent = node.textContent.trim();
            if (textContent.startsWith('<![CDATA[') && textContent.endsWith(']]>')) {
              result = `${indentStr}<${tagName}${attrStr}>${textContent}</${tagName}>`;
            } else {
              result = `${indentStr}<${tagName}${attrStr}>${textContent}</${tagName}>`;
            }
          } else if (node.childNodes.length === 0) {
            // Self-closing or empty element
            result = `${indentStr}<${tagName}${attrStr}/>`;
          } else {
            // Multi-line for elements with child elements
            result = `${indentStr}<${tagName}${attrStr}>`;
            
            for (let i = 0; i < node.childNodes.length; i++) {
              const child = node.childNodes[i];
              if (child.nodeType === Node.ELEMENT_NODE) {
                result += '\n' + formatNode(child, indent + 1);
              } else if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent.trim();
                if (text) {
                  result += '\n' + '  '.repeat(indent + 1) + text;
                }
              } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
                result += '\n' + '  '.repeat(indent + 1) + `<![CDATA[${child.textContent}]]>`;
              }
            }
            
            result += `\n${indentStr}</${tagName}>`;
          }
        }
        
        return result;
      };
      
      // Start formatting from root element
      return formatNode(xmlDoc.documentElement);
      
    } catch {
      // Fallback to original XML if formatting fails
      return xml.trim();
    }
  };

  const handleFormat = () => {
    try {
      const processedInput = prepareInput(input);
      
      // Basic XML validation using DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(processedInput, "application/xml");
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error("Invalid VAST XML structure");
      }

      const formatted = formatVAST(processedInput.trim());
      setOutput(formatted);
      setIsValid(true);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setIsValid(false);
    }
  };

  const minifyVAST = () => {
    try {
      const processedInput = prepareInput(input);
      
      // Basic validation first
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(processedInput, "application/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      
      if (parseError.length > 0) {
        throw new Error("Invalid VAST XML structure");
      }

      // Simple minification by removing extra whitespace
      const minified = processedInput.replace(/>\s*</g, '><').trim();
      setOutput(minified);
      setIsValid(true);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setIsValid(false);
    }
  };

  const validateVAST = () => {
    try {
      const processedInput = prepareInput(input);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(processedInput, "application/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      
      if (parseError.length > 0) {
        const errorText = parseError[0].textContent || parseError[0].innerText || "Unknown parsing error";
        setOutput(`❌ Invalid VAST XML: ${errorText}`);
        setIsValid(false);
        return;
      }
      
      const vastElements = xmlDoc.getElementsByTagName("VAST");
      if (vastElements.length === 0) {
        setOutput("❌ Not a valid VAST document - missing <VAST> root element");
        setIsValid(false);
        return;
      }
      
      const version = vastElements[0].getAttribute("version") || "Unknown";
      const ads = xmlDoc.getElementsByTagName("Ad");
      const creatives = xmlDoc.getElementsByTagName("Creative");
      
      let details = `✅ Valid VAST ${version} XML`;
      details += `\n📊 Structure: ${ads.length} Ad(s), ${creatives.length} Creative(s)`;
      
      setOutput(details);
      setIsValid(true);
      
    } catch (error) {
      setOutput(`❌ Validation Error: ${error.message}`);
      setIsValid(false);
    }
  };


  const analyzeVAST = () => {
    try {
      const processedInput = prepareInput(input);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(processedInput, "application/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      
      if (parseError.length > 0) {
        const errorText = parseError[0].textContent || parseError[0].innerText || "Unknown parsing error";
        throw new Error(`XML parsing failed: ${errorText}`);
      }

      // Extract VAST information
      const vastElements = xmlDoc.getElementsByTagName("VAST");
      const adElements = xmlDoc.getElementsByTagName("Ad");
      const impressionElements = xmlDoc.getElementsByTagName("Impression");
      const mediaFileElements = xmlDoc.getElementsByTagName("MediaFile");
      const clickThroughElements = xmlDoc.getElementsByTagName("ClickThrough");
      const trackingElements = xmlDoc.getElementsByTagName("Tracking");
      const companionElements = xmlDoc.getElementsByTagName("Companion");

      let analysis = '';
      
      if (vastElements.length > 0) {
        const version = vastElements[0].getAttribute("version");
        analysis += `📊 VAST Analysis\n`;
        analysis += `Version: ${version || 'Unknown'}\n`;
        analysis += `Ads: ${adElements.length}\n`;
        analysis += `Impressions: ${impressionElements.length}\n`;
        analysis += `Media Files: ${mediaFileElements.length}\n`;
        analysis += `Click Through URLs: ${clickThroughElements.length}\n`;
        analysis += `Tracking Events: ${trackingElements.length}\n`;
        analysis += `Companion Ads: ${companionElements.length}\n\n`;
        
        if (mediaFileElements.length > 0) {
          analysis += `📹 Media Files:\n`;
          for (let i = 0; i < Math.min(mediaFileElements.length, 5); i++) {
            const mediaFile = mediaFileElements[i];
            const type = mediaFile.getAttribute("type") || "Unknown";
            const width = mediaFile.getAttribute("width") || "?";
            const height = mediaFile.getAttribute("height") || "?";
            const url = mediaFile.textContent.trim();
            analysis += `${i + 1}. ${type} (${width}x${height})\n   ${url}\n`;
          }
          if (mediaFileElements.length > 5) {
            analysis += `   ... and ${mediaFileElements.length - 5} more\n`;
          }
        }
        
        if (companionElements.length > 0) {
          analysis += `\n📋 Companion Ads:\n`;
          for (let i = 0; i < Math.min(companionElements.length, 5); i++) {
            const companion = companionElements[i];
            const width = companion.getAttribute("width") || "";
            const height = companion.getAttribute("height") || "";
            const id = companion.getAttribute("id") || "N/A";
            
            // Get companion resource (StaticResource, IFrameResource, or HTMLResource)
            const staticResource = companion.getElementsByTagName("StaticResource")[0];
            const iframeResource = companion.getElementsByTagName("IFrameResource")[0];
            const htmlResource = companion.getElementsByTagName("HTMLResource")[0];
            
            let resourceType = "Unknown";
            let resourceUrl = "N/A";
            let dimensionDisplay = "";
            
            if (staticResource) {
              resourceType = staticResource.getAttribute("creativeType") || "Static";
              resourceUrl = staticResource.textContent.trim();
              dimensionDisplay = (width && height) ? `(${width}x${height})` : "(Auto)";
            } else if (iframeResource) {
              resourceType = "IFrame";
              resourceUrl = iframeResource.textContent.trim();
              dimensionDisplay = (width && height) ? `(${width}x${height})` : "(Auto)";
            } else if (htmlResource) {
              resourceType = "HTML";
              resourceUrl = "N/A"; // Don't show HTML content
              dimensionDisplay = (width && height) ? `(${width}x${height})` : "(Responsive)";
            }
            
            analysis += `${i + 1}. ${resourceType} ${dimensionDisplay} ID: ${id}\n`;
            // Only show URL for non-HTML resources
            if (resourceUrl !== "N/A" && resourceType !== "HTML") {
              analysis += `   ${resourceUrl}\n`;
            }
          }
          if (companionElements.length > 5) {
            analysis += `   ... and ${companionElements.length - 5} more\n`;
          }
        }
      } else {
        analysis = '❌ Not a valid VAST document - missing <VAST> root element';
      }

      setOutput(analysis);
      setIsValid(true);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setIsValid(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsValid(null);
  };

  const handleDownload = () => {
    if (!output) return;
    
    // Generate filename based on operation and content type
    let filename = 'formatted-vast';
    let extension = 'xml';
    
    if (output.includes('✅ Valid VAST') || output.includes('❌ Invalid VAST')) {
      filename = 'vast-validation';
      extension = 'txt';
    } else if (output.includes('📊 VAST Analysis')) {
      filename = 'vast-analysis';
      extension = 'txt';
    }
    
    downloadAsFile(output, `${filename}-${new Date().toISOString().slice(0, 10)}.${extension}`);
  };

  const loadSampleVAST = () => {
    const sampleVAST = `<VAST version="3.0">
  <Ad id="sample-ad">
    <InLine>
      <AdSystem>Sample Ad Server</AdSystem>
      <AdTitle>Sample Video Ad with Companion</AdTitle>
      <Impression><![CDATA[https://example.com/impression]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://example.com/start]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://example.com/q1]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://example.com/midpoint]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://example.com/q3]]></Tracking>
              <Tracking event="complete"><![CDATA[https://example.com/complete]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[https://example.com/clickthrough]]></ClickThrough>
            </VideoClicks>
            <MediaFiles>
              <MediaFile width="640" height="360" type="video/mp4" delivery="progressive">
                <![CDATA[https://example.com/video.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
        <Creative>
          <CompanionAds>
            <Companion id="banner-300x250" width="300" height="250">
              <StaticResource creativeType="image/jpeg">
                <![CDATA[https://example.com/banner-300x250.jpg]]>
              </StaticResource>
              <TrackingEvents>
                <Tracking event="creativeView"><![CDATA[https://example.com/companion-view]]></Tracking>
              </TrackingEvents>
              <CompanionClickThrough><![CDATA[https://example.com/companion-click]]></CompanionClickThrough>
            </Companion>
            <Companion id="skyscraper-160x600" width="160" height="600">
              <StaticResource creativeType="image/png">
                <![CDATA[https://example.com/skyscraper-160x600.png]]>
              </StaticResource>
              <CompanionClickThrough><![CDATA[https://example.com/skyscraper-click]]></CompanionClickThrough>
            </Companion>
          </CompanionAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;
    setInput(sampleVAST);
  };

  return (
    <div className="tool-container">
      <div className="three-column-layout">
        {/* Input Column */}
        <div className="input-column">
          <div className="input-group">
            <label className="input-label">
              VAST XML Input
            </label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="xml"
              placeholder="Paste your VAST XML here (supports JSON escapes, HTML entities, URL encoding, Unicode, etc.)..."
              name="vast-input-editor"
              height="calc(100vh - 16rem)"
              isDarkTheme={false}
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="action-column">
          <div className="primary-actions">
            <button className="btn btn-primary" onClick={handleFormat}>
              ✨ Format
            </button>
            <button className="btn btn-outline" onClick={minifyVAST}>
              🗜️ Minify
            </button>
            <button className="btn btn-primary" onClick={validateVAST}>
              ✅ Validate
            </button>
            <button className="btn btn-outline" onClick={analyzeVAST}>
              📊 Analyze
            </button>
          </div>

          <div className="secondary-actions">
            <button className="btn btn-outline" onClick={loadSampleVAST}>
              📄 Sample
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => setAutoUnescape(!autoUnescape)}
              title={autoUnescape ? 'Disable auto-unescape (JSON, HTML, URL, Unicode)' : 'Enable auto-unescape (JSON, HTML, URL, Unicode)'}
            >
              {autoUnescape ? '🔓 Smart Unescape' : '🔒 Manual'}
            </button>

            <button className="btn btn-outline" onClick={handleClear}>
              🗑️ Clear
            </button>
            {output && (
              <button className="btn btn-outline" onClick={handleDownload}>
                💾 Download
              </button>
            )}
          </div>
          
          <SimpleAd />
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="input-group">
            <label className="input-label">
              Result
              {isValid === true && <span className="status-indicator valid">✅ Valid</span>}
              {isValid === false && <span className="status-indicator invalid">❌ Invalid</span>}
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              language={output.startsWith('📊') || output.startsWith('📹') || output.startsWith('✅') || output.startsWith('⚠️') ? 'text' : 'xml'}
              readOnly={false}
              name="vast-output-editor"
              height="calc(100vh - 16rem)"

              showLineNumbers={true}
              placeholder="Formatted VAST XML will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VASTFormatter;
