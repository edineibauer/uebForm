<div class="{$form['class']} parent-input" {$form['atributos']} style="{$form['style']}">
    <label for="{$column}" class="col padding-4 color-text-grey font-small">
        {$nome} {($default === false) ? "*" : ""}
    </label>
    <div class="col radius border" style="background: rgba(200,200,200, 0.1);">
        <div class="hide buttonExtenContainer">
            <input type="hidden" data-model="{$ngmodel}" id="{$ngmodel}" data-format="list"
                    {($id != "")? "value='{$id}'" : ''} />
        </div>
        <div class="col s12 container relative padding-0">
            <input type="text" placeholder="pesquisar..." autocomplete="off" id="{$column}"
                    {($title != "")? "value='{$title}'" : ''}
                    {($size !== false)? "maxlength='{$size}' " : ''}
                    {($disabled)? "disabled='disabled' " : ''}
                    {($default === false)? 'required="required" ' : ''}
                   data-entity="{$relation}" data-parent="{$entity}"
                   class="form-list col"/>
            <div class="col clearfix"></div>
            <div class="col s12 list-complete" rel="one"></div>
        </div>
        <div class="multFieldsSelect" id="multFieldsSelect-{$relation}-{$column}">{$mult}</div>
    </div>
</div>