# uebForm - Biblioteca de Geração de Formulários

## Visão Geral da Biblioteca

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

## Conceitos Fundamentais

### Dicionário de Metadados

A biblioteca trabalha com o conceito de "Dicionário" (`Entity\Dicionario`), que contém metadados sobre uma entidade:
- Campos
- Tipos de dados
- Regras de validação
- Relacionamentos

### Meta

Cada campo da entidade é representado por um objeto `Meta`, que contém:
- Nome e tipo do campo
- Formato de exibição
- Configurações do formulário
- Valores padrão
- Regras de validação

### Fluxo de Funcionamento

1. **Requisição da View**:
   - O usuário acessa a URL `/form/{entidade}/{id}/{campos_opcionais}`
   - A view processa os parâmetros da URL

2. **Inicialização do Formulário**:
   - O JavaScript da view inicializa o formulário e passa os parâmetros
   - A classe `Form::getForm($id, $fields)` é chamada para gerar o HTML

3. **Processamento de Dados**:
   - Carrega o dicionário da entidade (`Dicionario`)
   - Prepara os inputs baseados nos metadados
   - Formata e processa valores dos campos

4. **Renderização**:
   - Utiliza templates Mustache para renderizar o formulário
   - Cada tipo de campo possui seu próprio template

5. **Interação JavaScript**:
   - Scripts JS gerenciam validação, máscaras e submissão
   - Comunicação assíncrona com o backend para salvamento e autocomplete

## Tipos de Campos Suportados

A biblioteca suporta diversos tipos de campos:
- Input (texto, número, etc.)
- Textarea
- Select/Dropdown
- Checkbox/Radio
- Switch
- Upload de arquivos
- Listas relacionais
- Campos de extensão (para relacionamentos complexos)

## Funcionalidades Especiais

### Autocomplete

A biblioteca oferece funcionalidade de autocompletar para campos relacionais:
- Busca dinâmica em entidades relacionadas
- Exibição de resultados em tempo real

### Validação

Suporte para validação de formulários:
- Validação no cliente via JavaScript
- Validação no servidor

### Relacionamentos

Gerencia relações entre entidades:
- One-to-One
- One-to-Many
- Many-to-Many

## Uso Programático (Alternativo)

Embora o principal método de uso seja através da view, a biblioteca também pode ser usada programaticamente:

```php
// Criar um formulário para a entidade "usuarios"
$form = new Form\Form("usuarios");

// Definir campos específicos para exibir
$form->setFields(["nome", "email", "telefone"]);

// Definir valores padrão
$form->setDefaults(["status" => 1]);

// Obter HTML do formulário
$html = $form->getForm();

// Ou mostrar diretamente
$form->showForm();
```

### Carregando Formulário para Edição

```php
// Carregar formulário para edição do registro com ID 5
$form = new Form\Form("usuarios");
$form->showForm(5);
```

## Endpoints API

A biblioteca disponibiliza vários endpoints para processamento:

- `/post/save/form.php`: Salva dados do formulário
- `/post/api.php`: API principal para interação com formulários
- `/post/autocomplete/form.php`: Gerencia autocomplete de campos
- `/post/children/form.php`: Gerencia formulários filhos
- `/post/read/list.php`: Leitura de listas relacionais

## JavaScript

Os arquivos JavaScript gerenciam a interação do usuário:
- `/public/view/form/js/_3_formValidate.js`: Validação de formulários
- `/public/view/form/js/_4_form_functions.js`: Funções principais
- `/public/view/form/js/_5_form.js`: Inicialização e comportamento do formulário

## Templates Mustache

Os templates Mustache são usados para renderizar diferentes partes do formulário:
- `/public/view/form/form.mustache`: Template principal do formulário
- `/public/view/form/tpl`: Templates específicos para cada tipo de campo (input.mustache, select.mustache, etc.)

## Considerações Importantes

1. A biblioteca depende de outras classes que devem estar disponíveis:
   - `Entity\Dicionario`
   - `Entity\Meta`
   - `Helpers\Template`
   - `Conn\Read`
   - `Conn\SqlCommand`

2. A biblioteca pressupõe que as entidades já existem ou cria automaticamente as tabelas se necessário.

3. Integração com sistema de permissões para controle de acesso aos formulários.