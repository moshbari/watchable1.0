import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExternalScriptConfig {
  text: string;
  url: string;
  delay: number;
  position: string;
  width: string;
  height: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
}

const defaultConfig: ExternalScriptConfig = {
  text: 'Click Here!',
  url: 'https://example.com',
  delay: 3,
  position: 'top-right',
  width: '200px',
  height: '50px',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  fontSize: '16px'
};

export const ExternalVideoScript: React.FC = () => {
  const [config, setConfig] = useState<ExternalScriptConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const updateConfig = (key: keyof ExternalScriptConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateScript = () => {
    const positionStyles = {
      'top-left': 'top: 20px; left: 20px;',
      'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
      'top-right': 'top: 20px; right: 20px;',
      'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);',
      'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
      'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
      'bottom-right': 'bottom: 20px; right: 20px;'
    };

    return `// Universal Video Overlay Button Script
// Place this script in the <head> or before </body> tag
<script>
(function() {
  'use strict';
  
  // Configuration
  const config = {
    text: '${config.text}',
    url: '${config.url}',
    delay: ${config.delay},
    position: '${config.position}',
    width: '${config.width}',
    height: '${config.height}',
    backgroundColor: '${config.backgroundColor}',
    textColor: '${config.textColor}',
    fontSize: '${config.fontSize}'
  };

  // Position styles
  const positionStyles = {
    'top-left': 'top: 20px; left: 20px;',
    'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
    'top-right': 'top: 20px; right: 20px;',
    'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
    'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
    'bottom-right': 'bottom: 20px; right: 20px;'
  };

  function createOverlayButton(videoContainer) {
    // Check if button already exists
    if (videoContainer.querySelector('.video-overlay-btn')) {
      return;
    }

    // Create button element
    const button = document.createElement('a');
    button.href = config.url;
    button.target = '_blank';
    button.className = 'video-overlay-btn';
    button.textContent = config.text;
    button.style.cssText = \`
      position: absolute;
      \${positionStyles[config.position] || positionStyles['top-right']}
      width: \${config.width};
      height: \${config.height};
      background-color: \${config.backgroundColor};
      color: \${config.textColor};
      font-size: \${config.fontSize};
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      transition: all 0.3s ease;
      animation: slideIn 0.5s ease-out forwards;
      animation-delay: \${config.delay}s;
      opacity: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: none;
      outline: none;
    \`;

    // Add hover effects
    button.addEventListener('mouseenter', function() {
      this.style.transform += ' scale(1.05)';
      this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = this.style.transform.replace(' scale(1.05)', '');
      this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    });

    // Add to container
    videoContainer.appendChild(button);

    // Show after delay
    setTimeout(() => {
      button.style.display = 'flex';
    }, config.delay * 1000);
  }

  function findVideoContainers() {
    // Common selectors for video containers
    const selectors = [
      'video',
      'iframe[src*="youtube"]',
      'iframe[src*="vimeo"]',
      'iframe[src*="wistia"]',
      'iframe[src*="brightcove"]',
      'iframe[src*="jwplayer"]',
      '[class*="video"]',
      '[class*="player"]',
      '[id*="video"]',
      '[id*="player"]'
    ];

    const containers = [];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Find the appropriate container
        let container = element;
        
        // If it's a video or iframe, look for a positioned parent
        if (element.tagName === 'VIDEO' || element.tagName === 'IFRAME') {
          let parent = element.parentElement;
          while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (style.position === 'relative' || style.position === 'absolute') {
              container = parent;
              break;
            }
            parent = parent.parentElement;
          }
          
          // If no positioned parent found, make the direct parent relative
          if (container === element && element.parentElement) {
            element.parentElement.style.position = 'relative';
            container = element.parentElement;
          }
        }
        
        // Ensure container has relative positioning
        if (container && window.getComputedStyle(container).position === 'static') {
          container.style.position = 'relative';
        }
        
        if (container && !containers.includes(container)) {
          containers.push(container);
        }
      });
    });

    return containers;
  }

  function addButtonsToVideos() {
    const containers = findVideoContainers();
    containers.forEach(container => {
      createOverlayButton(container);
    });
  }

  // Add CSS animation
  function addAnimationCSS() {
    if (document.getElementById('video-overlay-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'video-overlay-styles';
    style.textContent = \`
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    \`;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  function init() {
    addAnimationCSS();
    addButtonsToVideos();
    
    // Watch for dynamically added videos
    const observer = new MutationObserver(function(mutations) {
      let shouldCheck = false;
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
      });
      if (shouldCheck) {
        setTimeout(addButtonsToVideos, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
</script>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateScript());
      toast({
        title: "Copied!",
        description: "Universal video overlay script copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              Universal Video Overlay Script
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Universal Script:</strong> This script can be injected into any website to add overlay buttons to existing video players. Perfect for sites like MeetVio, YouTube, Vimeo, etc.
              </p>
            </div>

            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ext-button-text">Button Text</Label>
                <Input
                  id="ext-button-text"
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="Click Here!"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-button-url">Link URL</Label>
                <Input
                  id="ext-button-url"
                  value={config.url}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-delay">Delay (seconds)</Label>
                <Input
                  id="ext-delay"
                  type="number"
                  min="0"
                  value={config.delay}
                  onChange={(e) => updateConfig('delay', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-position">Position</Label>
                <select
                  id="ext-position"
                  value={config.position}
                  onChange={(e) => updateConfig('position', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="center-left">Center Left</option>
                  <option value="center">Center</option>
                  <option value="center-right">Center Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-width">Width</Label>
                <Input
                  id="ext-width"
                  value={config.width}
                  onChange={(e) => updateConfig('width', e.target.value)}
                  placeholder="200px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-height">Height</Label>
                <Input
                  id="ext-height"
                  value={config.height}
                  onChange={(e) => updateConfig('height', e.target.value)}
                  placeholder="50px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="ext-bg-color"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="ext-text-color"
                    type="color"
                    value={config.textColor}
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.textColor}
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Generated Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Universal Overlay Script</Label>
                <Button onClick={handleCopy} size="sm" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Script
                </Button>
              </div>
              <textarea
                readOnly
                value={generateScript()}
                className="w-full h-48 p-3 text-sm font-mono bg-muted border border-border rounded-md resize-none"
              />
              <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>How to use:</strong> Copy this script and inject it into any website using browser developer tools, a browser extension, or add it to the site's HTML if you have access. It will automatically detect video players and add overlay buttons.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};