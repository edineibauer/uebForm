# uebForm - Biblioteca de Geração de Formulários

## Visão Geral de como utilizar essa Biblioteca

O uebForm é uma biblioteca PHP para geração dinâmica de formulários baseados em metadados de entidades. A biblioteca permite criar e editar formulários de forma automatizada a partir de dicionários de metadados, oferecendo suporte para diversos tipos de campos e configurações personalizadas.

## Principal Método de Uso

**O principal recurso desta biblioteca é a view de formulário**, que permite gerar formulários completos através de uma URL simples seguindo o padrão:

```
//carrega todos os campos para cadastrar um novo registro
/form/{entidade}

//carrega todos os campos para editar um registro através do `id`
/form/{entidade}/{id}

//carrega apenas campos específicos
/form/{entidade}/{id}/{campo_titulo}/{campo_descricao}

//oculta o header do formulário, chame form-no-header como se fosse um campo específico
/form/{entidade}/{id}/form-no-header

//por padrão o formulário é carregado dentro de um card, para não fazer isso, chame form-no-card como se fosse um campo específico
/form/{entidade}/{id}/form-no-card

//carregar novo formulário com campos específicos sem cabeçalho e sem estar em um card
/form/{entidade}/{campo_titulo}/{campo_descricao}/{campo_ativo}/form-no-card/form-no-header
```

Esta abordagem permite integrar facilmente formulários em qualquer parte do sistema sem necessidade de código adicional, facilitando o desenvolvimento e manutenção.
Somado ao recurso de pageTransition() função javascript que permite que seja carregado uma view em uma div da view, fica prático de carregar um formulário personalizado como integração de uma view externa.
ex: pageTransition("form/{entidade}", "#divPai");
