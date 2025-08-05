import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimedButtonConfig {
  text: string;
  url: string;
  delay: number;
  width: string;
  height: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  alignment: 'left' | 'center' | 'right';
}

const defaultConfig: TimedButtonConfig = {
  text: 'Click Here!',
  url: 'https://example.com',
  delay: 3,
  width: '200px',
  height: '50px',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  fontSize: '16px',
  alignment: 'center'
};

export const TimedButton: React.FC = () => {
  const [config, setConfig] = useState<TimedButtonConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();

  const updateConfig = (key: keyof TimedButtonConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    // Reset preview when config changes
    setPreviewKey(prev => prev + 1);
  };

  const generateHTML = () => {
    return `<div class="timed-button-container" style="text-align: ${config.alignment};">
  <div class="timed-button" style="
    display: none;
    animation: fadeIn 0.5s ease-in forwards;
    animation-delay: ${config.delay}s;
  ">
    <a href="${config.url}" target="_blank" style="
      display: inline-block;
      width: ${config.width};
      height: ${config.height};
      background-color: ${config.backgroundColor};
      color: ${config.textColor};
      font-size: ${config.fontSize};
      text-decoration: none;
      border-radius: 8px;
      line-height: ${config.height};
      text-align: center;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    " 
    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
    >${config.text}</a>
  </div>
</div>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    display: block;
  }
}

.timed-button {
  animation-fill-mode: forwards;
}
</style>

<script>
// Show the button after delay
setTimeout(() => {
  document.querySelector('.timed-button').style.display = 'block';
}, ${config.delay * 1000});
</script>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateHTML());
      toast({
        title: "Copied!",
        description: "Timed button HTML code copied to clipboard",
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
              Add Timed Button
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button-text">Button Text</Label>
                <Input
                  id="button-text"
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="Click Here!"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="button-url">Link URL</Label>
                <Input
                  id="button-url"
                  value={config.url}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delay">Delay (seconds)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  value={config.delay}
                  onChange={(e) => updateConfig('delay', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alignment">Alignment</Label>
                <select
                  id="alignment"
                  value={config.alignment}
                  onChange={(e) => updateConfig('alignment', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={config.width}
                  onChange={(e) => updateConfig('width', e.target.value)}
                  placeholder="200px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={config.height}
                  onChange={(e) => updateConfig('height', e.target.value)}
                  placeholder="50px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
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
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
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

            {/* Preview */}
            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div className="border border-border rounded-lg p-4 bg-muted/30 min-h-[100px] flex items-center justify-center">
                <TimedButtonPreview key={previewKey} config={config} />
              </div>
            </div>

            {/* Generated Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated HTML Code</Label>
                <Button onClick={handleCopy} size="sm" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <textarea
                readOnly
                value={generateHTML()}
                className="w-full h-32 p-3 text-sm font-mono bg-muted border border-border rounded-md resize-none"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Preview Component
const TimedButtonPreview: React.FC<{ config: TimedButtonConfig }> = ({ config }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(false);
    const timer = setTimeout(() => {
      setShowButton(true);
    }, config.delay * 1000);

    return () => clearTimeout(timer);
  }, [config.delay]);

  if (!showButton) {
    return (
      <div className="text-muted-foreground text-sm">
        Button will appear in {config.delay} seconds...
      </div>
    );
  }

  return (
    <div style={{ textAlign: config.alignment, width: '100%' }}>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'inline-block',
          width: config.width,
          height: config.height,
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          fontSize: config.fontSize,
          textDecoration: 'none',
          borderRadius: '8px',
          lineHeight: config.height,
          textAlign: 'center',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
        }}
        className="hover:scale-105 hover:shadow-lg"
      >
        {config.text}
      </a>
    </div>
  );
};