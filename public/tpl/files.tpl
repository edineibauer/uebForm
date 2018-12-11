<div class="{$form['class']} parent-input col form-file" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        {if isset($allow['values'])}
            <form action="{$home}set" enctype="multipart/form-data" id="form-{$entity}-{$column}"
                  class="dropzone border radius relative" id="dropzone-{$entity}-{$column}">
                <div class="fallback">
                    <input name="file" class="hide" type="file" multiple
                           accept="{foreach item=name key=i from=$allow['values']}{if $i > 0},{/if}.{$name}{/foreach}"/>
                </div>
                <input type="hidden" name="file" value="save/source"/>
                <input type="hidden" name="lib" value="form-crud"/>
                <input type="hidden" name="entity" value="{$entity}"/>
                <input type="hidden" name="column" value="{$column}"/>
                <span class="{(empty($value)) ? "hide " : ""}padding-small right font-small hover-shadow dropzone-btn-removeall color-gray-light radius border pointer" style="position: absolute;right: 10px;top: -16px;" rel="{$entity}-{$column}">Excluir Tudo</span>
            </form>
            <input type="hidden" data-model="{$ngmodel}" id="{$entity}-{$column}" data-format="files"
                    {($value)? "value='{$value|@json_encode}'" : ''}
                    {($size !== false)? "maxlength='{$size}' " : ''} />
        {else}
            <h3>Arquivo não aceita Nenhum Valor</h3>
        {/if}
    </label>
</div>

<div class="dropzone-template hide">
    <div class="dz-preview dz-file-preview card left padding-small padding-8">
        <img data-dz-thumbnail/>
        <span data-dz-extension class="dropzone-extension font-xxlarge upper padding-small"></span>
        <div class="dz-details">
            <div class="dz-size" data-dz-size></div>
            <div class="dz-filename padding-8"><span class="font-medium padding-medium border radius z-depth-2" style="display: inline-flex" data-dz-name></span></div>
            <div class="col padding-8">
                <a href="" data-dz-url download target="_blank" class="btn-float dropzone-btn-download hover-shadow radius border z-depth-2 padding-small color-white pointer" style="display: inline-flex"><i class="material-icons">get_app</i></a>
                <span data-dz-remove class="btn-float color-hover-text-red hover-shadow radius border z-depth-2 padding-small color-white pointer" style="display: inline-flex">
                    <i class="material-icons">delete</i>
                </span>
            </div>
        </div>
        <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
        <div class="dz-error-message align-center"><span data-dz-errormessage></span></div>
        <div class="dz-success-mark"><span><i class="material-icons color-text-green font-jumbo">done_outline</i></span></div>
        <div class="dz-error-mark"><span><i class="material-icons color-text-red font-jumbo">close</i></span></div>
    </div>
</div>