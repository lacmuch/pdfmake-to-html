define(['loadash'],function(_){
    return function (pdfDocument){
        const children = pdfDocument.map(pdfStructureToHTMLComponent)

        return Div({}, children)
    }

    function Div(props, children){
      return createElement('div', props, children)
    }

    function Paragraph(props, children){
      return createElement('p', pdfPropsToHTMLAttrs(props), children)
    }

    function Span(props, children){
      return createElement('span', pdfPropsToHTMLAttrs(props), children)
    }

    function HtmlGrid(props, children){
      const gridSize = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

      return Div({
        class: `ui ${props.size ? gridSize[props.size-1] + ' columns' : ''} grid`,
      }, children)
    }

    function pdfStructureToHTMLComponent(component){
      if(_.isArray(component)){
        return Div({}, pdfStructureToHTMLComponent(component))
      }

      if(_.isString(component)){
        return Paragraph({}, [component])
      }

      if(_.isString(component.text)){
        return Paragraph(component, [component.text])
      }

      if(_.isArray(component.text)){
        return Paragraph(component, component.text.map(text => Span(text, [text.text || text])))
      }

      if(component.table){
        const children = component.table.body.map(row => {
          return Div({
            class: 'row',
          }, row.map(column => Div({
            class: 'column',
          }, [pdfStructureToHTMLComponent(column)])))
        })

        return HtmlGrid({size: component.table.body[0].length}, children)
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

      // Append children
      children.forEach(child => {
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
        if(prop === 'bold'){
          Object.assign({},acc,{style: 'font-weight: bold;'+acc.style});
        }
        return acc
      }, { style: '' })
    }
})