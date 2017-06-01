(isnode ? crosscode(require, module) : define)(['lodash'],function(_){
    var __pdfDocument;
    return function (pdfDocument){
        __pdfDocument = pdfDocument;
        const children = pdfDocument.content.map(pdfStructureToHTMLComponent)
        var props = {};
        if (__pdfDocument.styles && __pdfDocument.defaultStyle) Object.assign(props,__pdfDocument.defaultStyle);
        if (__pdfDocument.html && __pdfDocument.html.width) props.width=__pdfDocument.html.width;
        return Div(pdfPropsToHTMLAttrs(props), children)
    }

    function Div(props, children){
      return createElement('div', props, children)
    }

    function Paragraph(props, children){
      return createElement('div', pdfPropsToHTMLAttrs(props), children)
    }

    function Span(props, children){
      return createElement('span', pdfPropsToHTMLAttrs(props), children)
    }

    function Image(props){
      return createElement('img', pdfPropsToHTMLAttrs(props))
    }    

    function HtmlGrid(props, children){
      const gridSize = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

      return Div({
        class: 'ui' + (props.size ? (gridSize[props.size-1] + ' columns') : '') + ' grid',
        style: 'display: table; width: 100%;' //TODO: options
      }, children)
    }

    //----
    function pdfStructureToHTMLComponent(component){
      if(_.isArray(component)){
        return Div({}, component.map(item=>pdfStructureToHTMLComponent(item)))
      }

      if(_.isString(component) || _.isNumber(component)){
        return Paragraph({}, [component])
      }

      if(_.isString(component.text) || _.isNumber(component.text)){
        return Paragraph(component, [component.text])
      }

      if(_.isArray(component.text)){
        return Paragraph(component, component.text.map(text => Span(text, [text.text || text])))
      }

      if (component.image) {
        return Image(component)
      }

      if(component.table){
        var style='';
        if (component.layout) {
            var layout = __pdfDocument.layouts[component.layout];
            if (layout) {
                if (layout.vLineColor) {
                    style+='border-left-style: solid; border-left-color: '+layout.vLineColor+';';
                    style+='border-right-style: solid; border-right-color: '+layout.vLineColor+';';
                }
                if (layout.vLineWidth) {
                    style+='border-left-width: '+layout.vLineWidth+'px;';
                    style+='border-right-width: '+layout.vLineWidth+'px;';
                }
                if (layout.hLineColor) {
                    style+='border-top-style: solid; border-top-color: '+layout.hLineColor+';';
                    style+='border-bottom-style: solid; border-bottom-color: '+layout.hLineColor+';';
                }
                if (layout.hLineWidth) {
                    style+='border-top-width: '+layout.hLineWidth+'px;';
                    style+='border-bottom-width: '+layout.hLineWidth+'px;';
                }
            }
        }
        const children = component.table.body.map(row => {
          return Div({
            class: 'row',
            style: 'display: table-row;'+style //TODO: options
          }, row.map(column => Div({
            class: 'column',
            style: 'display: table-cell;'+style //TODO: options
          }, [pdfStructureToHTMLComponent(column)])))
        })

        return HtmlGrid({size: component.table.body[0]?component.table.body[0].length:''}, children)
      }

      if(component.stack){
        return Div({
          class: 'ui sixteen column wide',
        }, component.stack.map(segment => Div({
          class: 'ui sixteen column wide',
        }, [pdfStructureToHTMLComponent(segment)])))
      }
    }

    function createElement(tagName, htmlAttrs, children){
      const tag = document.createElement(tagName)

      // Append children if any
      if (children) children.forEach(child => {
        if(_.isString(child) || _.isNumber(child)){
          if (_.isNumber(child)) tag.innerHTML += child;
          else tag.innerHTML += child.replace(/\n/g, '<br/>')
        } else if (child) {
          tag.appendChild(child)
        }
      })

      // Append tags
      Object
        .keys(htmlAttrs)
        .forEach(attr => tag.setAttribute(attr, htmlAttrs[attr]))

      return tag
    }

    function pdfPropsToHTMLAttrs(pdfProps){
        return Object.keys(pdfProps).reduce((acc, prop) => {
            if (__pdfDocument.html && __pdfDocument.html.inline) {
                var val = pdfProps[prop]; 
                if (prop === 'alignment') acc.style+='text-align: '+val+';';
                if (prop === 'bold') acc.style+='font-weight: bold;';
                if (prop === 'font') acc.style+='font-family: '+val+';';
                if (prop === 'fontSize') acc.style+='font-size: '+(val+2)+'px;';
                if (prop === 'image') acc.src=val;
                if (prop === 'color') acc.style+='color: '+val+';';
                if (prop === 'fillColor') acc.style+='background-color:'+val+';';
                if (prop === 'width') {
                    if (val=='*') acc.style+='width: 100%;';
                    else {
                        acc.style+='width: '+val;
                        if (_.isNumber(val)) acc.style+='px;';
                        else acc.style+=';';
                    }
                }
                if (prop === 'style') {
                    if (_.isObject(val)) Object.assign(acc,pdfPropsToHTMLAttrs(val));
                    else if (__pdfDocument.styles[val]) 
                        Object.assign(acc,pdfPropsToHTMLAttrs(__pdfDocument.styles[val]));
                }
                if (prop === 'html') Object.assign(acc,pdfPropsToHTMLAttrs(val));   //override
            }
            return acc
        }, { style: 'padding: 2px 2px;' })
    }
})