/* eslint-disable @typescript-eslint/ban-ts-comment */
class XmlUtil {
  static namespaces: {
    xlink: 'http://www.w3.org/1999/xlink';
    xmlns: 'http://www.w3.org/2000/xmlns/';
    xsd: 'http://www.w3.org/2001/XMLSchema';
    xsi: 'http://www.w3.org/2001/XMLSchema-instance';
    wfs: 'http://www.opengis.net/wfs';
    gml: 'http://www.opengis.net/gml';
    ogc: 'http://www.opengis.net/ogc';
    ows: 'http://www.opengis.net/ows';
  };

  static xmldoc = new DOMParser().parseFromString('<root />', 'text/xml');

  public static setAttributes(node, attributes) {
    for (const name in attributes) {
      if (attributes[name] != null && attributes[name].toString) {
        const value = attributes[name].toString();
        const uri = XmlUtil.namespaces[name.substring(0, name.indexOf(':'))] || null;
        node.setAttributeNS(uri, name, value);
      }
    }
  }

  public static evaluate(xpath, rawxml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawxml, 'text/xml');
    const xpe = new XPathEvaluator();
    const nsResolver = xpe.createNSResolver(xmlDoc.documentElement);

    return xpe.evaluate(xpath, xmlDoc, nsResolver, XPathResult.ANY_TYPE, null);
  }

  public static createElementNS(name, attributes, options) {
    options = options || {};

    let uri = options.uri;

    if (!uri) {
      uri = XmlUtil.namespaces[name.substring(0, name.indexOf(':'))];
    }

    if (!uri) {
      uri = XmlUtil.namespaces[options.prefix];
    }

    const node = uri ? XmlUtil.xmldoc.createElementNS(uri, name) : XmlUtil.xmldoc.createElement(name);

    if (attributes) {
      XmlUtil.setAttributes(node, attributes);
    }

    if (options.value != null) {
      node.appendChild(XmlUtil.xmldoc.createTextNode(options.value));
    }

    return node;
  }

  public static createTextNode(value) {
    if (value || value === 0) {
      return XmlUtil.xmldoc.createTextNode(value);
    }

    return XmlUtil.xmldoc.createTextNode('');
  }

  public static getNodeText(node) {
    if (!node) {
      return '';
    }

    return node.innerText || node.textContent || node.text;
  }

  public static serializeXmlDocumentString(node) {
    const doc = document.implementation.createDocument('', '', null);
    doc.appendChild(node);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  public static serializeXmlToString(node) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(node);
  }

  public static parseXml(rawXml) {
    if (typeof window.DOMParser !== 'undefined') {
      return new window.DOMParser().parseFromString(rawXml, 'text/xml');
    } else if (
      // @ts-ignore
      typeof window.ActiveXObject !== 'undefined' &&
      // @ts-ignore
      new window.ActiveXObject('Microsoft.XMLDOM')
    ) {
      // @ts-ignore
      const xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(rawXml);
      return xmlDoc;
    } else {
      throw new Error('No XML parser found');
    }
  }

  public static parseOwsExceptionReport(rawXml) {
    const exceptionReportElement = XmlUtil.parseXml(rawXml).documentElement;
    if (!exceptionReportElement || exceptionReportElement.tagName !== 'ows:ExceptionReport') {
      return null;
    }

    const exceptionReport = {
      exceptions: [],
      message: '',
    };

    const exceptionsNodes = exceptionReportElement.getElementsByTagNameNS(XmlUtil.namespaces.ows, 'Exception');
    for (let i = 0, exceptionsNodesCount = exceptionsNodes.length; i < exceptionsNodesCount; i++) {
      const exceptionNode = exceptionsNodes[i];
      const exceptionCode = exceptionNode.getAttribute('exceptionCode');
      const exceptionsTextNodes = exceptionNode.getElementsByTagNameNS(XmlUtil.namespaces.ows, 'ExceptionText');
      const exception = {
        code: exceptionCode,
        text: '',
      };

      for (let j = 0, textNodesCount = exceptionsTextNodes.length; j < textNodesCount; j++) {
        const exceptionTextNode = exceptionsTextNodes[j];
        const exceptionText = exceptionTextNode.innerText || exceptionTextNode.textContent || exceptionTextNode.text;

        exception.text += exceptionText;
        if (j < textNodesCount - 1) {
          exception.text += '. ';
        }
      }

      exceptionReport.message += exception.code + ' - ' + exception.text;
      if (i < exceptionsNodesCount - 1) {
        exceptionReport.message += ' ';
      }

      exceptionReport.exceptions.push(exception);
    }

    return exceptionReport;
  }
}

export default XmlUtil;
