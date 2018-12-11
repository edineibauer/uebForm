<div class="{$form['class']} selecaoUniqueCard row {($parentValue == "")? "hide" : ""}" {$form['atributos']} style="{$form['style']}">
    <div class="row padding-medium color-text-grey font-small">
        <span class="left">
            {$nome} d{$genero} {$parentColumn|ucfirst}
            {($default === false) ? "*" : ""}
        </span>
        <span class="left titleRequired opacity {($parentValue == "")? "" : "hide"}">
            &nbsp; (Selecione um{if $genero == "a"}a{/if} <b>{$parentColumn|ucfirst}</b> antes)
        </span>
    </div>
    <div class="row">
        <div class="hide">
            <input type="hidden" data-model="{$ngmodel}" id="{$ngmodel}" data-format="list"
                    {($id != "")? "value='{$id}'" : ''} />
        </div>
        <div class="col s12 container relative">
            <input type="text" placeholder="{$nome}" autocomplete="off" id="{$column}" required="required"
                    {($parentValue == "")? "disabled='disabled'" : ''}
                    {($title != "")? "value='{$title}'" : ''}
                    {($size !== false)? "maxlength='{$size}' " : ''}
                    {($default === false)? 'required="required" ' : ''}
                   data-entity="{$relation}" data-parent="{$entity}"
                   class="form-list selecaoUnique rest {($parentValue == "")? "disabled" : ''}"/>
            <div class="col s12 list-complete" rel="one"></div>
        </div>
    </div>
</div>