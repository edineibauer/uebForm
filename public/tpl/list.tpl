<div class="{$form['class']} parent-input parent-relation col" {$form['atributos']} style="{$form['style']}">
    <label for="{$column}" class="col padding-4 color-text-grey font-small">
        {$nome} {($default === false) ? "*" : ""}
    </label>
    <div class="col list_mult_input radius border" style="background: rgba(200,200,200, 0.1);">
        <div class="col buttonExtenContainer right padding-4">
            <button class="btn btnRelation theme-d2 listButton right transition-ease-25 opacity hover-shadow hover-opacity-off list-{$column}"
                    rel="single" data-entity="{$relation}" data-fields='{$form['fields']|@json_encode}'
                    data-defaults='{$form['defaults']|@json_encode}' data-autosave="{$autosave}"
                    {($disabled)? "disabled='disabled' " : ''}>
                <i class="material-icons prefix pointer editList transition-ease-25">{($id != "")? "edit" : 'add'}</i>
            </button>
            <input type="hidden" data-model="{$ngmodel}" id="{$ngmodel}" data-format="list"
                    {($id != "")? "value='{$id}'" : ''} />
        </div>
        <div class="rest relative div-blur">
            <input type="text" placeholder="pesquisar..." autocomplete="off" id="{$column}"
                    {($title != "")? "value='{$title}'" : ''}
                    {($size !== false)? "maxlength='{$size}' " : ''}
                    {($disabled)? "disabled='disabled' " : ''}
                    {($default === false)? 'required="required" ' : ''}
                   data-entity="{$relation}" data-parent="{$entity}"
                   class="form-list rest"/>
            <div class="col s12 list-complete" rel="one"></div>
        </div>
        <div class="tpl_div_new_mult hide" rel="single"></div>

        <div class="multFieldsSelect" id="multFieldsSelect-{$relation}-{$column}">{$mult}</div>
    </div>
</div>